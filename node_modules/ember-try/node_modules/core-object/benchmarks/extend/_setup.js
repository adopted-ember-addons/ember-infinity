module.exports = function setup() {
  if (this.distribution === 1) {
    this.data = {
      firstName: function() { }
    };
  } else if (this.distribution === 5) {
    this.data = {
      firstName:  function() { this._super(); },
      lastName:   function() { this._super(); },
      middleName: function() { },
      age:        function() { },
      sex:        function() { }
    };
  } else {
    throw new Error("OMG");
  }
};


