from flask import Flask, jsonify
import os
from datetime import datetime
import re
from collections import defaultdict, Counter
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes



# Helper function to parse a transaction line
def parse_transaction(line):
    parts = line.strip().split(',')
    sales_staff_id = int(parts[0])
    timestamp = parts[1]
    
    # Try parsing with seconds first, then without seconds
    try:
        transaction_time = datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        transaction_time = datetime.strptime(timestamp, '%Y-%m-%dT%H:%M')
    
    products = re.findall(r'(\d+):(\d+)', parts[2])
    sale_amount = float(parts[3])
    return sales_staff_id, transaction_time, products, sale_amount

# Main function to process files and calculate metrics
def process_transactions(folder_path):
    daily_sales_volume = defaultdict(int)
    daily_sales_value = defaultdict(float)
    product_sales = Counter()
    monthly_sales_staff = defaultdict(lambda: defaultdict(float))
    hourly_transaction_volume = defaultdict(list)

    # Iterate over all files in the folder
    for filename in os.listdir(folder_path):
        if filename.endswith('.txt'):
            file_path = os.path.join(folder_path, filename)
            with open(file_path, 'r') as file:
                for line in file:
                    sales_staff_id, transaction_time, products, sale_amount = parse_transaction(line)
                    
                    # Daily aggregation
                    date = transaction_time.date()
                    daily_sales_volume[date] += sum(int(qty) for _, qty in products)
                    daily_sales_value[date] += sale_amount
                    
                    # Product aggregation
                    for product_id, qty in products:
                        product_sales[product_id] += int(qty)
                    
                    # Monthly aggregation
                    month = transaction_time.strftime('%Y-%m')
                    monthly_sales_staff[month][sales_staff_id] += sale_amount
                    
                    # Hourly aggregation
                    hour = transaction_time.hour
                    hourly_transaction_volume[hour].append(sum(int(qty) for _, qty in products))
    
    # Calculate metrics
    highest_sales_volume_day = max(daily_sales_volume.items(), key=lambda x: x[1])
    highest_sales_value_day = max(daily_sales_value.items(), key=lambda x: x[1])
    most_sold_product = product_sales.most_common(1)[0]
    highest_sales_staff_per_month = {month: max(staff_sales.items(), key=lambda x: x[1]) for month, staff_sales in monthly_sales_staff.items()}
    highest_hour_by_avg_volume = max(hourly_transaction_volume.items(), key=lambda x: sum(x[1]) / len(x[1]))
    
    return {
        'highest_sales_volume_day': {
            'date': highest_sales_volume_day[0].isoformat(),
            'total_volume': highest_sales_volume_day[1]
        },
        'highest_sales_value_day': {
            'date': highest_sales_value_day[0].isoformat(),
            'total_value': highest_sales_value_day[1]
        },
        'most_sold_product': {
            'product_id': most_sold_product[0],
            'total_quantity': most_sold_product[1]
        },
        'highest_sales_staff_per_month': {
            month: {
                'staff_id': staff[0],
                'total_sales': staff[1]
            } for month, staff in highest_sales_staff_per_month.items()
        },
        'highest_hour_by_avg_volume': {
            'hour': highest_hour_by_avg_volume[0],
            'average_volume': sum(highest_hour_by_avg_volume[1]) / len(highest_hour_by_avg_volume[1])
        }
    }

@app.route('/analytics', methods=['GET'])
def get_analytics():
    folder_path = r'C:\Users\HP\Documents\monie-hackathon\data'
    results = process_transactions(folder_path)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)