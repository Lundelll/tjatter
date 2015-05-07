Messages = new Mongo.Collection("messages");

if (Meteor.isClient) {
  Meteor.subscribe("messages");

  Template.body.helpers({
    messages: function () {
      return Messages.find({}, {sort: {createdAt: 1}});
    },
    isAdmin: function () {
      return Meteor.user().username === "Lundell";
    }
  });

  Template.body.events({
    "click #removeMessages": function() {
      Meteor.call("clearMessages");
    }
  });

  // Always keep the scroll at the bottom.
  Template.message.rendered = function () {
    $('.chat-box').scrollTo( $('.chat-box').prop("scrollHeight") );
  };

  Template.registerHelper("formatTimestamp", function (timestamp) {
    return moment(new Date(timestamp)).format("hh:mm:ss");
  });

  Template.message_input.events({
    "submit .new-message": function (event) {
      var message = event.target.text.value;

      if(message) {
          Meteor.call("addMessage", message);
          event.target.text.value = "";
          $('.error-msg').text('');
      } else {
        $('.error-msg').text('You can\'t send nothing. Please write something');
      }
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
    var lastHour = new Date();
    lastHour.setHours(lastHour.getHours() -1);
    return Messages.find({createdAt: {$gt: lastHour}}, {sort: {createdAt: 1}});
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
  },
  clearMessages: function () {
    if(! Meteor.userId() || ! Meteor.user().username === "Lundell") {
      throw new Meteor.Error("Not an admin");
    }

    Messages.remove({});
  }
});