# DeFi Lending Protocol
![GitHub last commit](https://img.shields.io/github/last-commit/thecaptainfalcon/defi-lending)

![Investor Dashboard](/images/md_images/p3_investor_dashboard.png "Investor Dashboard - DeFi Lending")

[Interactive Tableau Dashboard](https://public.tableau.com/app/profile/joseph708/viz/P3Draft/InvestorDashboard) 

## What is this project?

This project analyzes the comparison in yield potential when lending assets between different lending protocols and asset types within the Solana blockchain.

The yield potential is tracked on a daily and weekly basis, which is measured by a data scraping script that activates every 15 minutes, and is then averaged by the date filters.

KPI metrics are focused on the 2 types: volatile and non-volatile (stablecoin), which helps to differentiate between an asset with fluctuating price points and a stablecoin.

The reason for this split is to provide a measure to the risk-on/risk-off assessment within the crypto environment

## Domain Key terms & definitions: 
- **LP:** Sometimes referred to as the Liquidity Pool, but for this dashboard its short for the Lending Protocol.
- **TVL:** Total Valued Locked. This is the total valuation of assets that are being lended as the supply. In the TradFi world, this is the same as the Assets Under Management (AUM).
- **Asset:** This the blanket term used in this dashboard to refer to all coins, tokens, and stablecoins.
- **DeFi:** Decentralized Finance.
- **Lending:** When you provide liquidity in exchange for yield (This is different for each protocol or entity that provides this incentive).
- **Stablecoin:** Tokens that are pegged to a collateralised currency, whether it be Fiat currency or an asset that retains its valuation regardless of time or market conditions (ie. gold, silver). 
- **Volatile APY:** This refers to the APY for all NON-stablecoin assets. 

## Tech Stack:

Script:
- Node.js (JavaScript)
- Puppeteer (library for Chromium webscraping)
- NodeCron (library for interval automation)

Data Analyst/Viz:
- Excel (for brainstorm and pre-data)
- Tableau
- MySQL

## What is the extent of this project?

While there are numerous protocols or Dapps focused on yield aggregation or lending, this project only focuses on the 3 most popular DeFi lending platforms within the Solana blockchain.

This also means that the assets in question are based on the cross-chain trading metrics within Solana, not within their native chains or by global means.

In addition to this, the yield portion only applies to the lending APY and has no implications on the borrowing aspects or leveraged farm methods within the protocols.

## Who is the end user and what do they care about the most?

Investors active within the crypto space, especialy those that are more inclined to have a risk-off mentality and want to capitalize on small gains without huge capital fluctuations and risk associated with more volatile assets.

Investors care about yield and reduction in any unnecessary risk; by converting risky assets into liquid stablecoins, they can choose to sit and wait for ideal market conditions or utilize minimal risk to return for small gains.

## How are the chosen KPIs determined and why are they important?

(Volatile APY, Stablecoin APY, LP TVL)

Volatile APY refers to the assets that face more direct risk exposure and experience price fluctuations. Investing in these assets are geared towards those that are more risk-averse or are holding long positions on blue-chips with a low price point average.

Stablecoin APY refers to the tokens known as stablecoins that are pegged to a 1:1 collateralized Fiat currency or value retaining asset. These tokens function as the liquid assets that face no direct risk exposure (only third party exploits if lending), and represents a position in which investors are wanting to off-load most of the risk, while waiting for ideal market conditions.

The LP TVL represents the average of the lending supply between all the lending protocols. These metrics help to identify possible third-party exploits (massive decrease in TVL levels), surplus/shortage of lending supply, which can affect the rates of borrowing rates (not applicable to this project, though), and the underlying trend of the lending market. 

## Where did the data come from?

- https://tulip.garden/lend
- https://francium.io/app/lend
- https://francium.io/app/invest/farm (for the TVL amount)
- https://solend.fi/dashboard

As noted above, the webscraping script was built using the Node.js library, Puppeteer. 
NodeCron was also utilized to automate the execution of the script in a 15 minute interval.
After the data was scraped, it would then be pushed to a localhost MySQL database.

Connecting Tableau from here would have been ideal, however Tableau Public has numerous limitations on data connection sources/extracts, therefore an extra step of exporting a CSV file of each table was required.

At this point, the data could only be updated through this manual step, but if a different data viz software or a higher plan version of Tableau was used, the concept of dynamic data would still remain.

## Challenges faced during the project?

Balancing the DRY (Don't Repeat Yourself) coding concepts with an MVP (Minimumal Viable Product) approach.

The focus of the project isn't revolved around the scripting portion, but being able to extract and load the data to analyze the data is still an important step in the ETL process. 

Separating the "components" that made up the script into sections caused some issues, because the script needed to be ran in an asynchronous manner, but some steps in the processes had to be ran in a synchronous manner as some variables were dependent on the full execution and completion of another step.

In addition, when exporting modules that were dependent on another factor, the compilation during run-time would result in an error, therefore some core code portions that would have ideally been combined in one file, had to be repeated in different files with slight variances to achieve the same purpose.

One aspect of this includes the usage of timestamps. One global timestamp to connect and join a singular data piece with another would have capitalised on data conservation, however this was not a possible route as the components were now separated, and ran asynchronously at its own pace. Thus, by attempting to connect the timestamps would have complicated the code by an unncessary margin.

In conclusion, the code isn't "fully" optimised, but functions in the purpose it was built for: extracting data in a determined interval for analysis and dashboarding.

Another issue faced within the code is the unknown factor of when certain CSS selectors would finish rendering or when the network would idle after fully loading the specified elements in the webpage.

Due to this issue, it was difficult to determine the 'perfect' time in which the script would continue to execute and grab the correct data. In order to alleviate this issue, a delay was set to run whenever the script needed to load a webpage to provide sufficient time to load everything regardless of ping, internet speed, CPU processing power, etc.

Because of this, the timestamp of each extracted data may have been off by a few minutes (at the worst case), which could be argued that the accuracy of the extracted data is not 'completely' accurate, but its good enough.

Price needed to only be grabbed once, but because we were using a relational database, a data point had to be connected to each and every set of data, otherwise when showcasing the data through charts, there would be an empty patch.

This resulted in having to obtain the same data for price numerous times to affix with each LP table.

## How do you use the dashboard?

The top 2 charts where the average APY is filtered by the LP and by the asset type, each data point can be clicked to filter and affect other charts within the dashboard.

The icons below these charts are also another way to filter based on the LP and asset to affect every chart in the dashboard. Furthermore, the time-series charts could be sorted to display the dates by day or by week in combination with other filtering options.

Note: the KPI metrics serve to show the overall average and do not reflect changes when clicking on other filtering options or data sets to preserve the unique filters set to showcase a volatile or stablecoin specific data.

The arrangement of the charts were built with the mindset of an investor trying to figure out the overall yield aspect of lending and then filtering by the largest broad filter to the most specific. The time series data helps to provide the short term trend of possible yield within the LP and assets while also bring able to see the relationship of the uptrend or downtrend based on price fluctations (for volatile assets).


What other data would help to make this existing dataset more effective in drawing conclusions?

Longer dataset timelines, shorter time intervals in which the script is run.

In addition, more asset pairs both in the volatile and stablecoin types would provide more sensible yield averages in the KPI metrics, as well as the other customisable options in the dashboard.

However, all of these extra features would require extensive data infrastructure implications that would best be suited for a high performance server with a dedicated data storage and standalone script that isn't affected by latency or ram/processing issues.

## What actions do you recommend for end users based on the data?

This depends on the risk-aversity of the investor and whether they are holding positons in a mix of volatile and stablecoin assets.

For the most part though, I would only recommend 2 strict options, one of which is a 5-10% contribution of lending within their whole crypto portfolio. This is to take advantage of small gains to help offset inflation with minimal risk.

The risks are more so related to third-party exploits which have occurred to many other promising platforms with similar functionalities as these LPs. 

While there is the option of obtaining insurance for exploits or depegging, it would eat into the minimal gains that already exist and would not be sensible to even consider.

The second option is the full risk-off route and not lending any portion of your portfolio. This is a great option too, as it would provide a more liquid setup where one could capitalise on lower price averages on assets they may be bullish on.

## EER Diagram
![MySQL EER Diagram](/images/md_images/p3_eer_diagram.JPG "EER Diagram")

### Author notes:

Creating a help overlay requires white space where the text for instructions would be as the layers below would not be covered. The workaround is to take a full screenshot using the tableau image download function and then create the instructions without depending on applied filters that would move bar charts in location and size.
