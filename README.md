# Bitcoin Spending Calculator

A standalone web application for calculating Bitcoin spending and savings with advanced goal tracking and ARR projections.

## Features

- **Daily/Monthly Spending Analysis**: Calculate how much Bitcoin you've spent across different categories
- **Historical Price Integration**: Fetch historical Bitcoin prices for accurate spending calculations
- **Bitcoin Goal Tracking**: Set Bitcoin holding goals and track progress
- **ARR Projections**: Estimate time to reach goals based on annual return rate assumptions
- **Spending History**: Track and review past calculations
- **Real-time Bitcoin Price**: Automatically fetches current Bitcoin price from CoinGecko API

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd bitcoin-spending-calculator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and go to: `http://localhost:3001`

## How It Works

### Basic Spending Analysis
1. Select daily or monthly period
2. Enter your income (optional)
3. Add spending categories with amounts and dates
4. Click "Calculate Bitcoin Analysis"

### Advanced Features

#### Bitcoin Goal Tracking
- Enable the goal section
- Set your target Bitcoin amount (e.g., 1.0 BTC)
- View progress as percentages of your goal

#### ARR Projections
- Enable both Goal and ARR sections
- Enter estimated Bitcoin annual return rate
- Get projections for:
  - Time to reach your goal
  - Future portfolio value
  - Required monthly Bitcoin savings

## API Dependencies

- **CoinGecko API**: For current and historical Bitcoin prices
- No API keys required - uses public endpoints

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Data Storage**: Browser localStorage for history
- **APIs**: CoinGecko for Bitcoin price data

## Port Configuration

The application runs on port 3001 by default to avoid conflicts with other Bitcoin dashboard applications.

## License

MIT License
