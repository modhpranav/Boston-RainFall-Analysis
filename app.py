import streamlit as st
import pandas as pd

# Set the page layout to wide
st.set_page_config(layout='wide')

boston_rainfall_data = pd.read_csv("boston_rainfall_data.csv")
boston_rainfall_data.drop(columns=["Unnamed: 0"], inplace=True)
boston_rainfall_data["Location"] = boston_rainfall_data['Location'].apply(lambda x:x.split(" - ")[0])

st.title('Boston Rainfall Data')
col = st.columns([1,2])

# Create a dropdown for the year at the top of the page
selected_year = col[0].selectbox('Select a Year', boston_rainfall_data['year'].unique())

# Filter the data for the selected year
chart_data = boston_rainfall_data[boston_rainfall_data['year'] == selected_year]

# Create a container in the second column
container = st.container(border=True)

with container:
    # Update the vega_lite_chart parameters
    st.vega_lite_chart(
        chart_data,
        {
            "mark": {"type": "bar", "stack": "normalize"},
            "encoding": {
                "x": {
                    "field": "Location", 
                    "type": "nominal", 
                    "axis": {"labelAngle": 0}  # Adjust the angle here
                },
                "y": { 
                    "field": "Inches", 
                    "type": "quantitative",
                    "title": "Inches of Rainfall",
                    "axis": {"grid": False}
                },
                "color": {
                    "field": "Month", 
                    "type": "nominal",
                    "sort": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    "scale": {"range": ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94"]}  # Add this line
                },
                "tooltip": [
                    {"field": "Month", "type": "nominal"},
                    {"field": "Inches", "type": "quantitative"},
                    {"field": "Location", "type": "nominal", "title": "Location"}  # Add this line
                ]
            },
        },
        use_container_width=True
    )
