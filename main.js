const express = require('express')
const app = express()
const port = 3000
let data = [
    {
        "id": "1",
        "title": "a title",
        "views": 100
    },
    {
        "id": "2",
        "title": "another title",
        "views": 200
    },
    {
        "id": "3",
        "title": "another titlee",
        "views": 300
    },
    {
        "id": "4",
        "title": "haha",
        "views": 700
    },
    {
        "id": "5",
        "title": "hohio",
        "views": 900
    },
    {
        "title": "Ngao",
        "views": 800,
        "id": "7",
        "isDeleted": false
    },
    {
        "title": "Mu",
        "views": 1000,
        "id": "10"
    }
]

app.get('/products', (req, res) => {
    let queries = req.query;
    let titleQ = queries.title ? queries.title : '';
    let maxView = queries.maxvie ? queries.maxvie : 1E6;
    let minView = queries.minvie ? queries.minvie : 0;
    let page = queries.page ? queries.page : 1;
    let limit = queries.limit ? queries.limit : 4;
    let result = data.filter(
        function (e) {
            return !(e.isDeleted
                && e.title.includes(titleQ)
                && e.views >= minView
                && e.views <= maxView
            )
        }
    )
    result = result.splice(limit*(page-1),limit);
    res.send(result)
})
app.get('/products/:ids', (req, res) => {
    let id = req.params.ids;
    let result = data.find(
        function (e) {
            return !(e.isDeleted) && e.id == id
        }
    )
    if (result) {
        res.send(result)
    } else {
        res.status(404).send({
            message: "id not found"
        })
    }

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})