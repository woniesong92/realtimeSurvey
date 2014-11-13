$(function() {
  window.data = [{name: "Amanda", vote: 0},
                {name: "Katie", vote: 0},
                {name: "Janice", vote: 0},
                {name: "Kim", vote: 0},
                {name: "Amy", vote: 0}];

  window.pubnub = PUBNUB.init({
      channel: "survey",
      publish_key: "pub-c-aa0da548-076b-4c46-bf87-87d2d457368a",
      subscribe_key: "sub-c-c3f6a9fe-45cb-11e4-a251-02ee2ddab7fe"
  });

  pubnub.subscribe({
    channel: 'survey',
    message: increment
  });

  function sendData(msg) {
    pubnub.publish({
        channel: 'survey',
        message: msg
    });
  }

  function draw(data) {
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
        return (d.vote*10)+15 + "px";
      })
      .text(function(d) { return d.vote });
    bars.selectAll("div")
      .text(function(d) { return d.vote })
      .style("width", function (d) {
        return (d.vote*10)+15 + "px";
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
      channel: 'survey',
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