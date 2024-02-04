import React, { useState } from 'react';
import { Button } from 'carbon-components-react';

const sentimentColors = 
    {"Bearish" : "#8B0000",
    "Somewhat-Bearish" : "#FFA500",
    "Neutral" : "#DAA520",
    "Somewhat-Bullish" : "#9ACD32",
    "Bullish" : "#006400"}
;
const companies = [
    { name: 'APPL', description: 'AAPL represents the stock symbol for Apple Inc., a multinational technology company headquartered in Cupertino, California. They design, manufacture, and sell a wide range of consumer electronics, software, and online services.', sentiment: "Bullish"},
    { name: 'TSLA', description: 'TSLA represents the stock symbol for Tesla, Inc., an American multinational automotive and clean energy company.', sentiment: "Bearish"},
    { name: 'MSFT', description: 'MSFT represents the stock symbol for Microsoft Corporation, a multinational technology company headquartered in Redmond, Washington. ', sentiment: "Neutral"},
    { name: 'PG', description: 'PG stands for Parental Guidance Suggested. It\'s a rating used in the United States by the Motion Picture Association of America (MPAA) to indicate that some material may not be suitable for children. This means that parents are advised to consider whether the content might be upsetting or inappropriate for their young children.', sentiment: "Somewhat-Bullish"},
    { name: 'AMZN', description: 'Amazon.com, Inc. is an American multinational technology company.', sentiment: "Somewhat-Bearish"},
  ];

const TextComponent: React.FC = () => {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    const handleClick = (companyName: string) => {
        if (selectedCompany === companyName) {
            setSelectedCompany(null);
        } else {
            setSelectedCompany(companyName);
        }
    };

    const apiKey = 'NINY2G3WUL3MNRDX';
    const symbol = 'AAPL';

    let a = fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`)
        .then(response => response.json())
        .then(data => console.log(data));

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap'}}>
    {companies.map((company, index) => (
      <div key={index} style={{ margin: '10px 10px 20px 10px', width: '200px', display: 'flex', flexDirection: 'column' }}>
        <Button 
          onClick={() => handleClick(company.name)}
          style={{
            backgroundColor: sentimentColors[company.sentiment as keyof typeof sentimentColors],
            color: '#fff', // white text
            border: 'none', // remove border
            borderRadius: '4px', // rounded corners
            padding: '10px 20px', // vertical and horizontal padding
            fontSize: '1em', // text size
            cursor: 'pointer', // change cursor on hover
            transition: 'background-color 0.3s ease', // smooth color change on hover
            width: '100%', // full width
          }}
        >
          {company.name}
        </Button>
        {selectedCompany === company.name && (
          <div style={{ marginTop: '10px', flex: '1', minHeight: '50px' }}>
            <p><b>Sentiment</b>: {company.sentiment}</p>
            <p>{company.description}</p>
          </div>
        )}
      </div>
    ))}
  </div>
    );
};
export default TextComponent;