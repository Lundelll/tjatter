Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
  Meteor.subscribe("messages");

  Template.body.helpers({
    messages: function () {
      return Messages.find({}, {sort: {createdAt: 1}});
    }
  });

  Template.message_input.events({
    "submit .new-message": function (event) {
      var message = event.target.text.value;

      Meteor.call("addMessage", message);

      event.target.text.value = "";

      // prevent default form submit
      return false;
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
};

if (Meteor.isServer) {
  // publish all the messages.
  Meteor.publish("messages", function() {
    return Messages.find({}, {sort: {createdAt: 1}});
  });

};

Meteor.methods({
  addMessage: function (message) {
    if(! Meteor.userId()) {
      throw new Meteor.Error("Not authorized.");
    }

    Messages.insert({
      message: message,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  }
});