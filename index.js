const express = require('express')
const app = express()
app.set('port',4020)

app.use(express.static(__dirname+'/app'))

app.listen(app.get('port'), function() {
    console.log("Express erver started on http://localhost:"+app.get('port'))
})