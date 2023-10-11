Back-end Deployment Link
---------------
https://tif-backend-task-1.onrender.com

NOTES:
It currenty uses cookie based auth,
so, from the deployment link, it cannot directly store the jwt cookie in browser due to security issues, 
(ref: same site cookies )
But, it will work fine if the front-end and the backend it deployed from the same server
OR, 
The client is delpoyed in a different location but the client - server comm is done through HTTPS
for example the REACT front is deployed on netlify which calls the apis through the HTTPS deployment link.

Backend Installation
--------------------

To install backend dependencies, run the following command at the root directory:

`npm install`


To start the backend development server only, use the following command:

`npm run server`

Backend Environment File Format
-------------------------------

`PORT=4000`<br>
`JWT_KEY=`<br>
`NODE_ENV=`<br>
`MONGO_URI=`

Please make sure to replace the placeholders (e.g., JWT_KEY, MONGO_URI) with appropriate values relevant to your setup.








