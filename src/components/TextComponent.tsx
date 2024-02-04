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
    { name: 'APPL', description: 'Apple Inc. is an American multinational technology company.', sentiment: "Bullish"},
    { name: 'TSLA', description: 'Tesla, Inc. is an American electric vehicle and clean energy company.', sentiment: "Bearish"},
    { name: 'MSFT', description: 'Microsoft Corporation is an American multinational technology company.', sentiment: "Neutral"},
    { name: 'PG', description: 'Procter & Gamble Co. is an American multinational consumer goods corporation.', sentiment: "Somewhat-Bullish"},
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
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', paddingBottom: '200px'}}>
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
            <p>Sentiment: {company.sentiment}</p>
            <p>{company.description}</p>
          </div>
        )}
      </div>
    ))}
  </div>
    );
};
export default TextComponent;