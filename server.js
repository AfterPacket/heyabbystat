const express = require('express');
const fetch = require('node-fetch'); // Make sure to install node-fetch
const app = express();
const port = 3000; // Port can be any free port on your server

app.use(express.json());

function fetchWithTimeout(url, options, timeout = 7000) { // Set default timeout as 7000 ms
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
    ]);
}

app.get('', async (req, res) => {
    try {
        const response = await fetch('https://www.beheyabby.com:9330/abby/plant/environment', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Host": "www.beheyabby.com:9330",
                "Accept-Encoding": "gzip, deflate, br",
                "Connection": "keep-alive",
                "User-Agent": "UniversalApp/3.1.0 (iPhone; iOS 17.1; Scale/3.00)",
                "Accept-Language": "en-US;q=1",
                "token": ""
            },
            body: JSON.stringify({
                "mobileModel": "iPhone 13 Pro Max",
                "mobileBrand": "apple",
                "version": "3.1.0",
                "channel": "appstore",
                "longitude": -73.,
                "inchMefricMode": "",
                "latitude": 41.,
                "osType": 2,
                "token": "",
                "timeZone": -,
                "city": "",
                "altitude": 88.
            })
        });

        const data = await response.json();
        if (data && data.data && data.data.environments) {
            const formattedHtml = formatDataToHtmlTable(data.data.environments);
            res.send(formattedHtml); // Send the formatted HTML back to the client
        } else {
            console.error('Invalid or missing data:', data);
            res.status(500).send('Invalid response data');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

function formatDataToHtmlTable(environments) {
    if (!Array.isArray(environments)) {
        return '<p>No environment data available</p>';
    }

    return environments.map(env => `
        <tr>
            <td>💡 ${env.detectionValue}</td>
            <td>${formatHealthStatus(env.healthStatus)}</td>
            <td>📊 ${env.value}</td>
            <td>🤖 ${env.automation}</td>
            <td>📝 ${env.explain}</td>
            <td>⚡ ${env.currentSwitch}</td>
        </tr>
    `).join('');
}

function formatHealthStatus(healthStatus) {
    if (!healthStatus) {
        return '❤️ Status Unknown';
    }
    return healthStatus === 'Low' ? '❤️ Needs Attention' : `❤️ ${healthStatus}`;
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
