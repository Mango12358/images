const parseNum = (num) => {
  if (num.indexOf('.') > 0) {
    return parseFloat(num);
  } else {
    return parseInt(num);
  }
}


const cal = (num, command) => {
  if (isNaN(parseNum(num))) {
    return num;
  }
  switch (command) {
    case "左移":
      var newNum = "";
      if (num.charAt(0) == '-') {
        newNum += '-';
        num = num.substr(1)
      }
      newNum += num.substring(1, num.length)
      newNum += num.charAt(0)
      return parseNum(newNum);
    case "右移":
      var newNum = "";
      if (num.charAt(0) == '-') {
        newNum += '-';
        num = num.substr(1)
      }
      newNum += num.charAt(num.length - 1)
      newNum += num.substring(0, num.length - 1)
      return parseNum(newNum);
    case "翻转":
      var newNum = "";
      if (num.charAt(0) == '-') {
        newNum += '-';
        num = num.substr(1)
      }
      for (var i = num.length - 1; i >= 0; i--) {
        newNum += num.charAt(i)
      }
      return parseNum(newNum);
    case "镜像":
      var newNum = "";
      var newNum = "";
      if (num.charAt(0) == '-') {
        newNum += '-';
        num = num.substr(1)
      }
      newNum += num;
      for (var i = num.length - 1; i >= 0; i--) {
        newNum += num.charAt(i)
      }
      return parseNum(newNum);
    case "10转":
      var newNum = "";
      if (num.charAt(0) == '-') {
        newNum += '-';
        num = num.substr(1)
      }
      for (var i = 0; i < num.length; i++) {
        var tmpNum = parseNum(num.charAt(i));
        if (tmpNum == 0) {
          newNum += "0";
        } else {
          newNum += "" + (10 - tmpNum)
        }
      }
      return parseNum(newNum);
    case "X^2":
      var tmp = parseNum(num)
      return tmp * tmp
    case "X^3":
      var tmp = parseNum(num)
      return tmp * tmp * tmp
    case "求和":
      var res = 0;
      var isFu = false;
      for (var i = 0; i < num.length; i++) {
        if (num.charAt(i) == '-') {
          isFu = true;
          continue;
        }
        res += parseNum(num.charAt(i))
      }
      if (isFu) {
        res = -res;
      }
      return res;
    case "<<":
      if (num.indexOf('.') > 0) {
        return num;
      }
      return parseInt(parseInt(num) / 10)
    case "+/-":
      return 0 - parseNum(num)
  }
  if (command.indexOf("=>") >= 0) {
    var subC = command.split("=>");
    console.log(subC[1])
    return num.replace(new RegExp(subC[0], "g"), subC[1])
  }

  switch (command.charAt(0)) {
    case '+':
    case '-':
      return parseNum(num) + parseNum(command);
    case 'x':
      return parseNum(num) * parseNum(command.substr(1));
    case '/':
      return parseNum(num) / parseNum(command.substr(1));
    case 'F':
      if (num.indexOf('.') >= 0) return num;
      var newNum = "";
      if (num.charAt(0) == '-') {
        newNum += '-';
        num = num.substr(1)
      }
      var s = parseNum(command.charAt(1))
      var e = parseNum(command.charAt(2))
      if (num.length < s + 1) {
        return parseNum(num)
      }
      if (s > num.length || e > num.length) return num;
      var tmp = parseNum(num.charAt(num.length - 1 - s)) + parseNum(num.charAt(num.length - 1 - e))
      console.log("test", tmp)
      for (var i = 0; i < num.length; i++) {
        var j = num.length - 1 - i;
        if (j == s) {
          continue;
        } else if (j == e) {
          newNum += '0'
        } else {
          newNum += num.charAt(i);
        }
      }
      for (var i = 0; i < e; i++) {
        tmp *= 10;
      }
      return parseNum(newNum) + tmp;
    default:
      return parseNum(num + command)
  }
}



const store = (num, command) => {
  command.num = num;
  return command;
}

const up = (num, commands) => {
  for (var i = 0; i < commands.length; i++) {
    if (commands[i].op != "[-]" && commands[i].op != "[+]" && commands[i].num != undefined) {
      commands[i].num = "" + (parseNum(num) + parseNum(commands[i].num))
    }
  }
  return commands;
}

module.exports = { cal, up, store }