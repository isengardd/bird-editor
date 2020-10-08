<template>
  <div :id="containerId">
    <img :id="imgId" :src="srcTagImg" class="bd-comment-line" @mousedown.prevent="onMouseDown($event, imgId)" />
    <div :id="endPointId1" class="bd-line-end-point" @mousedown.prevent="onMouseDown($event, endPointId1)"></div>
    <div :id="endPointId2" class="bd-line-end-circle" @mousedown.prevent="onMouseDown($event, endPointId2)">
      {{ itemIdx + 1 }}
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import $ from "jquery";
import * as functions from "@/utility/functions";
import { CommentData } from "@/utility/classes";

const lineWidth = 2; // 线宽
const radius = 10; // 圆圈半径
const padding = 10; // canvas图片内边距
@Component({
  components: {},
})
export default class CommentLineItems extends Vue {
  public name = "CommentLineItems";

  public srcTagImg: string;
  public containerId: string;
  public imgId: string;
  public endPointId1: string;
  public endPointId2: string;
  public color: string;
  @Prop({ default: 0 }) readonly itemIdx!: number;
  @Prop({ default: 0 }) readonly x1!: number;
  @Prop({ default: 0 }) readonly y1!: number;
  @Prop({ default: 0 }) readonly x2!: number;
  @Prop({ default: 0 }) readonly y2!: number;

  public constructor() {
    super();

    this.srcTagImg = "";
    this.containerId = `comment-line-container-${this.itemIdx}`;
    this.imgId = `comment-line-${this.itemIdx}`;
    this.endPointId1 = `endpoint1-${this.itemIdx}`;
    this.endPointId2 = `endpoint2-${this.itemIdx}`;
    this.color = "#f00";
  }

  public mounted() {
    this.drawCommentLine(this.x1, this.y1, this.x2, this.y2, this.color);
    this.updatePosition(this.x1, this.y1, this.x2, this.y2);
  }

  // 获取父容器相对页面左上角的全局坐标
  public getParentPosition() {
    const containerEle = document.getElementById(this.containerId);
    if (containerEle) {
      const position = functions.getElementPagePosition(containerEle);
      return {
        x: position.x,
        y: position.y,
        width: $(containerEle).width() || 0,
        height: $(containerEle).height() || 0,
      };
    }
    return null;
  }

  public drawCommentLine(x1: number, y1: number, x2: number, y2: number, color: string) {
    const canvas = document.createElement("canvas");
    let xMin = x1;
    let xMinY = y1;
    let xMax = x2;
    let xMaxY = y2;
    const yMin = Math.min(y1, y2);
    if (xMin > xMax) {
      [xMin, xMax] = [xMax, xMin];
      [xMinY, xMaxY] = [xMaxY, xMinY];
    }
    canvas.width = Math.abs(x1 - x2) + 2 * padding;
    canvas.height = Math.abs(y1 - y2) + 2 * padding;

    if (canvas.getContext !== null) {
      //console.log("canvas.getContext !== null");
      const imgCtx = canvas.getContext("2d");
      if (imgCtx != null) {
        imgCtx.strokeStyle = color;
        imgCtx.lineWidth = lineWidth;
        imgCtx.lineCap = "butt";
        imgCtx.beginPath();
        // 画线
        imgCtx.moveTo(0 + padding, xMinY - yMin + padding);
        imgCtx.lineTo(xMax - xMin + padding, xMaxY - yMin + padding);
        imgCtx.stroke();
        imgCtx.closePath();
        // 画圆
        imgCtx.beginPath();
        imgCtx.moveTo(x2 - xMin + padding, y2 - yMin + padding);
        imgCtx.arc(x2 - xMin + padding, y2 - yMin + padding, radius, 0, Math.PI * 2, false);
        imgCtx.fillStyle = color;
        imgCtx.fill();
        imgCtx.closePath();
        this.srcTagImg = canvas.toDataURL("image/png");
      }
    }
  }

  public updatePosition(x1: number, y1: number, x2: number, y2: number) {
    //
    const xMin = Math.min(x1, x2);
    const yMin = Math.min(y1, y2);
    const imgElement = document.getElementById(this.imgId);
    if (imgElement !== null) {
      this.setImgPosition(imgElement, xMin, yMin);
    }

    const endP1Element = document.getElementById(this.endPointId1);
    if (endP1Element !== null) {
      this.setPointPosition(endP1Element, x1, y1);
    }

    const endP2Element = document.getElementById(this.endPointId2);
    if (endP2Element !== null) {
      this.setPointPosition(endP2Element, x2, y2);
    }
  }

  public setImgPosition(element: HTMLElement, x: number, y: number) {
    $(element).css({ top: `${y - padding}px`, left: `${x - padding}px` });
  }

  public setPointPosition(element: HTMLElement, x: number, y: number) {
    const pointWidth = $(element).width();
    if (pointWidth) {
      $(element).css({ top: `${y - pointWidth / 2}px`, left: `${x - pointWidth / 2}px` });
    }
  }

  public checkInArea(x1: number, y1: number, x2: number, y2: number): boolean {
    const parentElementPos = this.getParentPosition();
    if (!parentElementPos) {
      return false;
    }
    // 箭头一端必须在父窗口内
    if (x1 < 0 || x1 > parentElementPos.width || y1 < 0 || y1 > parentElementPos.height) {
      return false;
    }

    // 圆圈一端必须在父窗口padding范围内
    if (x2 < 0 + padding || x2 > parentElementPos.width - padding || y2 < 0 + padding || y2 > parentElementPos.height - padding) {
      return false;
    }
    return true;
  }

  public onMouseDown(downEv: MouseEvent, elementID: string) {
    //console.log("onMouseDown:" + elementID);
    const element = document.getElementById(elementID);
    if (element) {
      // 注册鼠标移动事件
      let lastX = downEv.pageX;
      let lastY = downEv.pageY;
      window.onmousemove = (moveEv: MouseEvent) => {
        //console.log("onmousemove:" + elementID);

        if (elementID === this.imgId) {
          // 计算与上一次的偏移值
          const offsetX = moveEv.pageX - lastX;
          const offsetY = moveEv.pageY - lastY;
          const newX1 = this.x1 + offsetX;
          const newY1 = this.y1 + offsetY;
          const newX2 = this.x2 + offsetX;
          const newY2 = this.y2 + offsetY;
          // 是否越界
          if (!this.checkInArea(newX1, newY1, newX2, newY2)) {
            return;
          }

          this.drawCommentLine(newX1, newY1, newX2, newY2, this.color);
          this.updatePosition(newX1, newY1, newX2, newY2);
          lastX = moveEv.pageX;
          lastY = moveEv.pageY;

          const cmtData = new CommentData({});
          cmtData.lineX1 = newX1;
          cmtData.lineY1 = newY1;
          cmtData.lineX2 = newX2;
          cmtData.lineY2 = newY2;
          this.$emit("data-change", this.itemIdx, cmtData);
        } else if (elementID === this.endPointId1 || elementID === this.endPointId2) {
          const parentElementPos = this.getParentPosition();
          if (!parentElementPos) {
            console.log("onmousemove get container position null");
            return;
          }

          const newX = moveEv.pageX - parentElementPos.x;
          const newY = moveEv.pageY - parentElementPos.y;
          // 计算是否越界
          if (elementID === this.endPointId1) {
            if (!this.checkInArea(newX, newY, this.x2, this.y2)) {
              return;
            }
          } else if (elementID == this.endPointId2) {
            if (!this.checkInArea(this.x1, this.y1, newX, newY)) {
              return;
            }
          }

          const cmtData = new CommentData({});
          if (elementID === this.endPointId1) {
            this.drawCommentLine(newX, newY, this.x2, this.y2, this.color);
            this.updatePosition(newX, newY, this.x2, this.y2);
            cmtData.lineX1 = newX;
            cmtData.lineY1 = newY;
            cmtData.lineX2 = this.x2;
            cmtData.lineY2 = this.y2;
          } else if (elementID === this.endPointId2) {
            this.drawCommentLine(this.x1, this.y1, newX, newY, this.color);
            this.updatePosition(this.x1, this.y1, newX, newY);
            cmtData.lineX1 = this.x1;
            cmtData.lineY1 = this.y1;
            cmtData.lineX2 = newX;
            cmtData.lineY2 = newY;
          }

          this.$emit("data-change", this.itemIdx, cmtData);
        }
      };
      // 需要注册window下的鼠标抬起事件
      window.onmouseup = () => {
        //console.log("onmouseup:" + elementID);
        window.onmousemove = null;
        window.onmouseup = null;
      };
    }
  }
}
</script>
