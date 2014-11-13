$(function() {
  window.data = [{name: "Amanda", vote: 0},
                {name: "Katie", vote: 0},
                {name: "Janice", vote: 0},
                {name: "Kim", vote: 0},
                {name: "Amy", vote: 0}];

  var TODAY = new Date();
  TODAY = "" + TODAY.getFullYear() + TODAY.getMonth() + TODAY.getDate();

  window.pubnub = PUBNUB.init({
      channel: TODAY,
      publish_key: "pub-c-aa0da548-076b-4c46-bf87-87d2d457368a",
      subscribe_key: "sub-c-c3f6a9fe-45cb-11e4-a251-02ee2ddab7fe"
  });

  pubnub.subscribe({
    channel: TODAY,
    message: increment
  });

  function sendData(msg) {
    pubnub.publish({
        channel: TODAY,
        message: msg
    });
  }

  function update_scale_if_many_votes(width_scale, data) {
    for (var i=0; i<data.length; i++) {
      var d = data[i];
      if (d.vote >= 100) {
        return (width_scale / (Math.floor(d.vote/100)+1));
      }
    }
    return width_scale;
  }

  function draw(data) {
    var width_scale = 10;
    width_scale = update_scale_if_many_votes(width_scale, data);
    var bars = d3.select(".container")
      .selectAll(".bar-wrapper")
      .data(data);
    var barEnter = bars
      .enter()
      .append("div")
      .attr("class", "bar-wrapper")
    barEnter
      .append("button")
      .text(function(d) { return "Vote "+ d.name; })
      .attr("class", "vote-btn btn-default btn-primary")
      .on("click", function(d) {
        sendData(d.name);
      });
    barEnter
      .append("div")
      .attr("class", "bar")
      .style("width", function (d) {
        return (d.vote*width_scale)+15 + "px";
      })
      .text(function(d) { return d.vote });
    bars.selectAll("div")
      .text(function(d) { return d.vote })
      .style("width", function (d) {
        return (d.vote*width_scale)+15 + "px";
      });
    bars
      .exit()
      .remove()
  };

  function increment(msg) {
    for (var i=0; i<window.data.length; i++) {
      var el = window.data[i];
      if (el.name == msg) {
        el.vote += 1;
      }
    }
    draw(data);
  }

  function init_votes() {
    pubnub.history({
      channel: TODAY,
      start: 0,
      callback: function(msg) {
        var vote_history = msg[0];
        for (var i=0; i<vote_history.length; i++) {
          increment(vote_history[i]);
        }
      }
    });
  }

  init_votes();
  draw(data);
});