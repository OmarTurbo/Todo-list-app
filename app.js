//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin:Test123@cluster0.5lgwdgf.mongodb.net/todoDB")

const nameSchema = {
  name: String
};
const listSchema = {
  name: String,
  item: [nameSchema]
};


const List = mongoose.model("List", nameSchema);
const Item = mongoose.model("Item", listSchema);

const item1 = new List({
  name: "My Todo"
})

const item2 = new List({
  name: "Click + to add button"
})

const item3 = new List({
  name: "to Delete click clear all"
})

const defulteItems = [item1, item2, item3];



app.get("/", function (req, res) {

  List.find({}).then((foundList) => {
    if (foundList.length === 0) {
      List.insertMany(defulteItems).then(() => {
        console.log('done')
      })
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundList });
    }
  })



});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new List({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect('/');
  } else {
    Item.findOne({ name: listName }).then((foundItem) => {
      foundItem.item.push(item);
      foundItem.save();
      res.redirect("/" + listName);
    })
  }
});

app.post('/delete', (req, res) => {
  const deletedItemId = req.body.deletedItem;
  const listName = req.body.listName;
  if (listName === "Today") {
    List.findByIdAndRemove(deletedItemId).then((err) => {
      console.log(err)
      res.redirect("/");
    });
  } else {
    Item.findOneAndUpdate({ name: listName }, { $pull: { item: { _id: deletedItemId } } }).then(function (err) {
      if (!err) {
        res.redirect('/')
        res.redirect("/" + listName)
      }
    })

  }
})

app.get("/:paramName", function (req, res) {
  const paramName = _.capitalize(req.params.paramName);


  Item.findOne({ name: paramName }).then((foundItems) => {
    if (!foundItems) {
      item = new Item({
        name: paramName,
        item: defulteItems
      })

      item.save();
      res.redirect(`/${paramName}`)
    } else {
      res.render("list", { listTitle: foundItems.name, newListItems: foundItems.item })
    }
  })

});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
}); 