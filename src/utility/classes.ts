export class CommentData {
  public lineX1 = 0; // 起点坐标（有箭头的一端），相对父元素的x点坐标
  public lineY1 = 0;
  public lineX2 = 0; // 终点坐标（数字圆圈一端）
  public lineY2 = 0;
  // public msgX1 = 0;
  // public msgY1 = 0;
  // public msgX2 = 0;
  // public msgY2 = 0;
  // public msg = "";

  public constructor(init?: Partial<CommentData>) {
    Object.assign(this, init);
  }
}

export class CropData {
  public x1 = 0; // 左上角，相对父元素的x点坐标
  public y1 = 0;
  public x2 = 0; // 右下角
  public y2 = 0;

  public constructor(init?: Partial<CropData>) {
    Object.assign(this, init);
  }
}
