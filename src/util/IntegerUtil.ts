class IntegerUtil {
  public random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

export default new IntegerUtil();
