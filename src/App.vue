<template>
  <v-app>
    <v-card class="h-100" color="grey lighten-4" flat>
      <v-toolbar color="indigo" dark>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" icon tile class="mx-1" @click="onLoadImgBtnClick">
              <v-icon>mdi-upload</v-icon>
            </v-btn>
            <!-- 放置一个隐藏的input -->
            <input
              id="hideInputUpload"
              ref="hideInputUpload"
              v-show="false"
              type="file"
              accept="image/png, image/jpeg"
              @change="onImageSelect($event)"
            />
          </template>
          <span>加载图片</span>
        </v-tooltip>

        <v-spacer></v-spacer>
      </v-toolbar>

      <v-row class="bd-cropper-row">
        <v-col cols="2">
          <v-textarea outlined no-resize readonly height="500px" label="Json Output" :value="jsonOutput"></v-textarea>
          <v-btn color="primary" @click="genJsonOuput">生成json</v-btn>
          <v-btn class="mx-3" color="primary" @click="restoreCropData">还原裁剪框</v-btn>
        </v-col>
        <v-col cols="8" class="bd-cropper-col">
          <div class="bd-cropper-container" id="bd-cropper-container">
            <CommentLineItems
              class="bd-cropper-tag-layer"
              v-for="(data, i) in commentDatas"
              :key="i"
              :itemIdx="i"
              :x1="data.lineX1"
              :y1="data.lineY1"
              :x2="data.lineX2"
              :y2="data.lineY2"
              @data-change="OnCommentDataChange"
            ></CommentLineItems>
            <img ref="image" class="bd-cropper-box" :src="srcImg" @load="start" />
          </div>
        </v-col>
        <v-col cols="2">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" @click="addNewCmtLine">
                <v-icon dark>
                  mdi-plus
                </v-icon>
              </v-btn>
            </template>
            <span>添加新注释</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import $ from "jquery";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import CommentLineItems from "@/components/CommentLineItems.vue";
import { CommentData, CropData } from "@/utility/classes";
@Component({
  components: {
    CommentLineItems,
  },
})
export default class App extends Vue {
  public name = "App";

  public srcImg: string | ArrayBuffer | null; // 要裁剪的图片
  public cropper: Cropper | null; // cropperJS 组件
  public cropperOption: Cropper.Options | undefined;
  public jsonOutput: string;
  public commentDatas: CommentData[];

  public constructor() {
    super();

    this.srcImg = null;
    this.cropper = null;
    this.cropperOption = {
      aspectRatio: this.getAspectRatio, //裁剪框的比例
      autoCrop: true, //当初始化的时候（是否自动显示裁剪框）
      autoCropArea: 1,
      background: false, //是否显示网格背景
      center: false,
      checkOrientation: false, // Check the current image's Exif Orientation information.
      cropBoxMovable: true,
      dragMode: "none",
      guides: false, //是否显示裁剪的虚线
      highlight: false, //将选中的区域亮色处理
      modal: true, //是否开启遮罩，将未选中的地方暗色处理
      movable: false,
      responsive: true, // Re-render the cropper when resizing the window.
      restore: false, // Restore the cropped area after resizing the window.
      rotatable: false,
      scalable: false,
      viewMode: 2,
      zoomOnTouch: false,
      zoomOnWheel: false,
      zoomable: false,
    };
    this.jsonOutput = "";
    this.commentDatas = [];
  }

  //computed
  get getAspectRatio() {
    return 2000 / 1440;
  }

  public beforeDestroy() {
    this.stop();
  }

  public onLoadImgBtnClick() {
    const excelInput = document.getElementById("hideInputUpload");
    if (excelInput) {
      excelInput.click();
    }
  }

  public onImageSelect(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const fr = new FileReader();
      fr.onload = () => {
        console.log("load");
        this.srcImg = fr.result;
      };
      fr.readAsDataURL(files[0]);
    }
  }

  public start() {
    //
    console.log("start");
    if (this.cropper !== null) {
      this.cropper.destroy();
    }

    this.cropper = new Cropper(this.$refs.image as HTMLImageElement, this.cropperOption);
  }

  public stop() {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  public onImgLoad() {
    //
  }

  public onCropEnd() {
    //
  }

  public genJsonOuput() {
    if (this.cropper) {
      // 图片裁剪坐标（相对原图）
      const imageOriginWidth = (this.$refs.image as HTMLImageElement).naturalWidth;
      const imageOriginHeight = (this.$refs.image as HTMLImageElement).naturalHeight;
      const imageData = this.cropper.getImageData();
      const cropperData = this.cropper.getCropBoxData();
      const canvasData = this.cropper.getCanvasData();
      const scaleRateW = imageData.width / imageOriginWidth; // 宽度的缩放比例
      const scaleRateH = imageData.height / imageOriginHeight; // 高度的缩放比例
      const imgViewWidth = imageOriginWidth; // 视觉宽
      const imgViewHeigh = imageOriginHeight; // 视觉高
      const cropData = new CropData();
      cropData.x1 = parseInt(((cropperData.left - canvasData.left) / scaleRateW).toFixed(0));
      cropData.y1 = parseInt(((cropperData.top - canvasData.top) / scaleRateH).toFixed(0));
      cropData.x1 = cropData.x1 < 0 ? 0 : cropData.x1;
      cropData.y1 = cropData.y1 < 0 ? 0 : cropData.y1;
      cropData.x2 = cropData.x1 + parseInt((cropperData.width / scaleRateW).toFixed(0));
      cropData.y2 = cropData.y1 + parseInt((cropperData.height / scaleRateH).toFixed(0));
      cropData.x2 = cropData.x2 > imgViewWidth ? imgViewWidth : cropData.x2;
      cropData.y2 = cropData.y2 > imgViewHeigh ? imgViewHeigh : cropData.y2;

      // 注释点的坐标点（相对原图）
      const originCmtDataList = new Array<CommentData>();
      this.commentDatas.forEach(viewData => {
        const originData = new CommentData();
        // 视图坐标点换算成原图坐标点
        originData.lineX1 = parseInt((viewData.lineX1 / scaleRateW).toFixed(0));
        originData.lineY1 = parseInt((viewData.lineY1 / scaleRateH).toFixed(0));
        originData.lineX2 = parseInt((viewData.lineX2 / scaleRateW).toFixed(0));
        originData.lineY2 = parseInt((viewData.lineY2 / scaleRateH).toFixed(0));
        originCmtDataList.push(originData);
      });

      this.jsonOutput = JSON.stringify({ crop: cropData, cmtDatas: originCmtDataList });
    }
  }

  // 根据json数据恢复裁剪框和注释信息
  public restoreCropData() {
    if (!this.cropper) {
      return;
    }
    const restoreJsonData = `{
      "crop": {
        "x1": 42,
        "y1": 24,
        "x2": 714,
        "y2": 508
      },
      "cmtDatas": [
        {
          "lineX1": 345,
          "lineY1": 240,
          "lineX2": 375,
          "lineY2": 270
        },
        {
          "lineX1": 544,
          "lineY1": 443,
          "lineX2": 642,
          "lineY2": 368
        },
        {
          "lineX1": 116,
          "lineY1": 145,
          "lineX2": 146,
          "lineY2": 175
        },
        {
          "lineX1": 569,
          "lineY1": 111,
          "lineX2": 599,
          "lineY2": 141
        }
      ]
    }`;
    const imageOriginWidth = (this.$refs.image as HTMLImageElement).naturalWidth;
    const imageOriginHeight = (this.$refs.image as HTMLImageElement).naturalHeight;
    const imageData = this.cropper.getImageData();
    const canvasData = this.cropper.getCanvasData();
    const scaleRateW = imageData.width / imageOriginWidth; // 宽度的缩放比例
    const scaleRateH = imageData.height / imageOriginHeight; // 高度的缩放比例
    const jsonObj = JSON.parse(restoreJsonData);
    if ("crop" in jsonObj) {
      // 原图坐标转视图坐标
      const originCrop = new CropData(jsonObj["crop"]);
      const viewCropperData: Cropper.SetCropBoxDataOptions = {};
      viewCropperData.width = Math.floor((originCrop.x2 - originCrop.x1) * scaleRateW);
      viewCropperData.height = Math.floor((originCrop.y2 - originCrop.y1) * scaleRateH);
      viewCropperData.top = Math.floor(originCrop.y1 * scaleRateH + canvasData.top);
      viewCropperData.left = Math.floor(originCrop.x1 * scaleRateW + canvasData.left);
      if (viewCropperData.top < 0) {
        viewCropperData.top = 0;
      }
      if (viewCropperData.left < 0) {
        viewCropperData.left = 0;
      }
      this.cropper.setCropBoxData(viewCropperData);
    }

    if ("cmtDatas" in jsonObj) {
      this.commentDatas = [];
      // 这里等组件刷新后，再添加新点。
      // 如果不放nextTick，会出现已有的点不刷新的问题
      this.$nextTick(() => {
        (jsonObj["cmtDatas"] as CommentData[]).forEach((cmtData: CommentData) => {
          const originCmtData = new CommentData(cmtData);
          const viewCmtData = new CommentData();
          // 原图坐标转视图坐标
          viewCmtData.lineX1 = Math.floor(originCmtData.lineX1 * scaleRateW);
          viewCmtData.lineY1 = Math.floor(originCmtData.lineY1 * scaleRateH);
          viewCmtData.lineX2 = Math.floor(originCmtData.lineX2 * scaleRateW);
          viewCmtData.lineY2 = Math.floor(originCmtData.lineY2 * scaleRateH);
          this.commentDatas.push(viewCmtData);
        });
      });
    }
  }

  public addNewCmtLine() {
    if (this.cropper) {
      // 默认在中心点创建
      const containerEle = document.getElementById("bd-cropper-container");
      if (containerEle === null) {
        console.log("addNewCmtLine containerEle is null");
        return;
      }
      const containerWidth = $(containerEle).width();
      if (containerWidth === undefined) {
        console.log("addNewCmtLine containerWidth is undefined");
        return;
      }
      const containerHeight = $(containerEle).height();
      if (containerHeight === undefined) {
        console.log("addNewCmtLine containerHeight is undefined");
        return;
      }
      const newCmtData = new CommentData({
        lineX1: containerWidth / 2 - 15,
        lineY1: containerHeight / 2 - 15,
        lineX2: containerWidth / 2 + 15,
        lineY2: containerHeight / 2 + 15,
      });
      this.commentDatas.push(newCmtData);
    } else {
      console.log("addNewCmtLine cropper is null");
      return;
    }
  }

  public OnCommentDataChange(itemIdx: number, commentData: CommentData) {
    if (this.commentDatas.length > itemIdx) {
      // 显示赋值，触发双向绑定
      this.commentDatas[itemIdx].lineX1 = commentData.lineX1;
      this.commentDatas[itemIdx].lineY1 = commentData.lineY1;
      this.commentDatas[itemIdx].lineX2 = commentData.lineX2;
      this.commentDatas[itemIdx].lineY2 = commentData.lineY2;
    } else {
      console.log(`OnCommentDataChange out of index ${itemIdx}`);
    }
  }
}
</script>

<style lang="css">
/*cropperjs官网要求的img样式，不这么设定会有一些奇怪的问题*/
img {
  display: block;
  max-width: 100%;
}
</style>
