module.exports = function setup() {
  if (this.distribution === 0) {
  } else if (this.distribution === 1) {
    this.data = {
      firstName: 'Stefan'
    };
  } else if (this.distribution === 5) {
    this.data = {
      firstName:  'Stefan',
      lastName:   'Penner',
      middleName: 'Chrisitan',
      age:        '28',
      sex:        'Male'
    };
  } else {
    throw new Error('OMG');
  }
};
