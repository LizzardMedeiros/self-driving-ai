class RNA {
  constructor(neuronList = []) {
    this.levelList = [];
    for (let i = 0; i < neuronList.length - 1; i += 1) {
      this.levelList.push(new Level(neuronList[i], neuronList[i + 1]));
    }
  }

  static feedForward (inputList, network) {
    const [firstLevel, ...otherLevels] = network.levelList;

    let outputList = Level.feedForward(inputList, firstLevel);
    for (const level of otherLevels) {
      outputList = Level.feedForward(inputList, level);
    }

    return outputList;
  }
}

class Level {
  constructor (inputCount, outputCount) {
    this.inputList = new Array(inputCount);
    this.outputList = new Array(outputCount).fill();
    this.biasList = new Array(outputCount).fill().map(() => randomRange(-1, 1));
    this.weighList = [];

    this.inputList.fill().forEach(() => {
      this.weighList.push(
        new Array(outputCount).fill().map(() => randomRange(-1, 1))
      );
    });

  }

  static feedForward (inputList, level) {
    level.inputList = inputList;

    for (const i in level.outputList) {
      let sum = 0;
      for (const j in level.inputList) {
        sum += level.inputList[j] * level.weighList[j][i];
      }
      level.outputList[i] = (sum > level.biasList[i]) ? 1 : 0;
    }

    return level.outputList;
  }
}
