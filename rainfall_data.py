import pandas as pd
import os
import json
import matplotlib.pyplot as plt

def aggregate_data(folder_path):

    all_rainfall_data = pd.DataFrame()
    for file_name in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file_name)
        if file_name.endswith(".csv"):
            location = file_name.split('_')[-1].replace('.csv', '')
            temp_df = pd.read_csv(file_path)
            temp_df['Location'] = location
            all_rainfall_data = pd.concat([all_rainfall_data, temp_df], ignore_index=True)
    return all_rainfall_data

def json_data(data):
    grouped_data = data.groupby(["Location"])
    locs = []
    for location, group in grouped_data:
        avg_rainfall = group.groupby("year")["Inches"].mean().reset_index()
        location_data = avg_rainfall[['year', 'Inches']].to_dict(orient='records')
        # Define the filename using the location (replace spaces and special characters as needed)
        filename_safe_location = location[0].replace(' ', '_').replace('-', '_') + '.json'
        filepath = filename_safe_location
        locs.append(location[0].replace(' ', '_').replace('-', '_'))
        import pdb; pdb.set_trace()
        print(filename_safe_location)
        print(location_data)

        # Save the data to a JSON file
        with open(filepath, 'w') as f:
            json.dump(location_data, f, indent=4)
    print(locs)

def monthly_json_data(data):
    grouped_data = data.groupby(["Location", "year"])
    locs = {}
    for location, group in grouped_data:
        location, year = location
        filename_safe_location = location.replace(' ', '_').replace('-', '_') + f'_{year}_.json'
        filepath = filename_safe_location
        data = group[['Month', 'Inches']].to_dict(orient='records')
        if locs.get(location):
            locs[location][year] = data
        else:
            locs[location] = {year: data}
        # Save the data to a JSON file
        with open(f"boston_data/{filepath}", 'w') as f:
            json.dump(data, f, indent=4)
    for location, data in locs.items():
        print(location)
        print(data)
        print("--------------------------------------------------")

def calculate_average_annual_rainfall(dataframe):
    annual_rainfall = dataframe.groupby(['Location', 'year'])['Inches'].sum().reset_index()
    average_rainfall = annual_rainfall.groupby('Location')['Inches'].mean().reset_index()
    return average_rainfall.sort_values(by='Inches', ascending=False)

def find_year_with_highest_rainfall(dataframe):
    annual_rainfall = dataframe.groupby(['Location', 'year'])['Inches'].sum().reset_index()
    max_rainfall_years = annual_rainfall.loc[annual_rainfall.groupby('Location')['Inches'].idxmax()]
    return max_rainfall_years

def main():

    rainfall_data = aggregate_data('boston_data')

    json_data(rainfall_data)

    # Step 2: Calculate Average Annual Rainfall
    avg_rainfall = calculate_average_annual_rainfall(rainfall_data)
    print("Average Annual Rainfall by Location:\n", avg_rainfall)
    print(avg_rainfall['Location'])

    # Step 3: Find Year with Highest Rainfall
    highest_rainfall_years = find_year_with_highest_rainfall(rainfall_data)
    print("\nYear with Highest Rainfall by Location:\n", highest_rainfall_years)

    create_svg(highest_rainfall_years)


def create_svg(data):
    location_years = []
    for row in data.iterrows():
        row = row[1]
        location_years.append(row["Location"]+" ("+str(row["year"])+")")
    print(location_years)
    # Create a bar chart
    plt.figure(figsize=(10, 6))  # Set the figure size
    plt.bar(location_years, data["Inches"], color='skyblue')  # Create a bar chart
    plt.xticks(rotation=45, ha="right")  # Rotate the x-axis labels for better readability
    plt.ylabel('Highest Rainfall (inches)')  # Y-axis label
    plt.title('Highes tRainfall by Location in Boston (2010 - 2018)')  # Chart title

    # Save the plot as an SVG file
    # plt.savefig('highest_rainfall.svg', format='svg', bbox_inches='tight')

    # Clear the current figure to prevent re-plotting the same data in future plots
    plt.clf()





if __name__ == "__main__":
    main()
