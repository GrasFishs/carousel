import $ from "jquery";
import "./style.css";

const getWidth = $dom => parseFloat($dom.css("width").split("px")[0]);
const getHeight = $dom => parseFloat($dom.css("height").split("px")[0]);

export default class Carousel {
  constructor(wrapper, options = {}) {
    this.wrapper = $(wrapper);
    this.children = this.wrapper.children();
    this.options = options;
    this.index = 0;
    this.initDOM();
    this.initPrevNext();
    this.initOptions();
    this.initPicker();
    this.holdMove();
  }

  initDOM() {
    let maxH = 0;
    let maxW = 0;
    this.childrenWrapper = $("<div></div>")
      .addClass("childrenWrapper")
      .appendTo(this.wrapper);
    if (this.options.direction && this.options.direction === "vertical") {
      //垂直
      this.childrenWrapper.css({
        flexDirection: "column",
        top: 0
      });
    }
    for (let i = 0; i < this.children.length; i++) {
      let child = $(this.children[i]);
      child.addClass("child");
      if (getHeight(child) > maxH) {
        maxH = getHeight(child);
      }
      if (getWidth(child) > maxW) {
        maxW = getWidth(child);
      }
      let itemWrapper = $("<div></div>")
        .addClass("flex")
        .width(maxW)
        .height(maxH)
        .wrapInner(child)
        .appendTo(this.childrenWrapper);
    }
    this.wrapper.addClass("wrapper");
    this.wrapper.css({
      height: maxH,
      width: maxW
    });
  }

  initOptions() {
    if (this.options.during > 0) {
      this.autoPlay(this.options.during);
      this.wrapper.hover(
        e => this.stopPlay(),
        e => {
          this.autoPlay(this.options.during);
          this.childrenWrapper.off("mousemove");
        }
      );
    }
    //slide初始化
    switch (this.options.slide) {
      case "bounce":
        this.childrenWrapper.css(
          "transitionTimingFunction",
          "cubic-bezier(.56,-0.77,.51,1.59)"
        );
        break;
      case "ease":
      case null:
      case undefined:
      default:
        this.childrenWrapper.css("transitionTimingFunction", "ease");
    }
    this.initRect();
  }

  initPicker() {
    this.pickers = $("<div></div>").appendTo(this.wrapper);
    this.pickers.addClass("picker");
    for (let i = 0; i < this.children.length; i++) {
      let pickBtn = $(`<div></div>`)
        .addClass("pickBtn")
        .appendTo(this.pickers)
        .on("click", e => {
          this.index = i;
          this.toIndex();
        });
    }
    if (this.options.direction && this.options.direction === "vertical") {
      //垂直
      //目前不能放到verticalize()里
      this.pickers.css("flexDirection", "column");
      let offset = getHeight(this.wrapper) / 2 - getHeight(this.pickers) / 2;
      this.pickers.css("top", offset);
      $(".pickBtn")
        .css({
          marginRight: 0,
          marginBottom: 2
        })
        .eq(this.children.length - 1)
        .css({
          marginBottom: 0
        });
      $(".pickBtn")
        .eq(0)
        .css({
          height: 20,
          width: 10
        });
    } else {
      let offset = getWidth(this.wrapper) / 2 - getWidth(this.pickers) / 2;
      this.pickers.css("left", offset);
    }
  }

  initPrevNext() {
    if (this.options.direction && this.options.direction === "vertical") {
    } else {
      this.prev = $("<div></div>")
        .addClass("prev_next prev")
        .text("<")
        .appendTo(this.wrapper);
      this.next = $("<div></div>")
        .addClass("prev_next next")
        .text(">")
        .appendTo(this.wrapper);
      this.prev.on("click", e => {
        if (this.index === 0) {
          this.index = this.children.length - 1;
        } else {
          this.index--;
        }
        this.toIndex();
      });

      this.next.on("click", e => {
        if (this.index === this.children.length - 1) {
          this.index = 0;
        } else {
          this.index++;
        }
        this.toIndex();
      });
    }
  }

  autoPlay(during) {
    this.options.during = during;
    this.autoInterval = setInterval(() => {
      if (this.index === this.children.length - 1) {
        this.index = 0;
      } else {
        this.index++;
      }
      this.toIndex();
    }, during);
  }

  stopPlay() {
    clearInterval(this.autoInterval);
  }

  holdMove() {
    let startX = 0;
    let startY = 0;
    let move = 0;
    const wrapperWidth = getWidth(this.wrapper);
    const wrapperHeight = getHeight(this.wrapper);
    this.wrapper.on("touchstart", e => {
      startX = e.targetTouches[0].pageX;
      startY = e.targetTouches[0].pageY;
    });
    this.wrapper.on("touchmove", e => {
      let curX = e.targetTouches[0].pageX;
      let curY = e.targetTouches[0].pageY;
      if (this.options.direction && this.options.direction === "vertical") {
        move = curY - startY;
        this.childrenWrapper.css("top", move - this.index * wrapperHeight);
      } else {
        move = curX - startX;
        this.childrenWrapper.css("left", move - this.index * wrapperWidth);
      }
    });
    this.wrapper.on("touchend", e => {
      if (move > wrapperWidth / 2 && this.index !== 0) {
        //右滑=>后退
        this.index--;
      } else if (
        -move > wrapperWidth / 2 &&
        this.index !== this.children.length - 1
      ) {
        //左滑<=前进
        this.index++;
      }
      this.toIndex();
    });
  }

  toIndex() {
    if (this.options.direction && this.options.direction === "vertical") {
      this.childrenWrapper.css({
        top: `-${getHeight(this.wrapper) * this.index}px`
      });
      $(".pickBtn")
        .eq(this.index)
        .css({
          background: "#00000080",
          height: 20
        })
        .siblings()
        .css({
          background: "#00000030",
          height: 20
        });
    } else {
      this.childrenWrapper.css({
        left: `-${getWidth(this.wrapper) * this.index}px`
      });
      $(".pickBtn")
        .eq(this.index)
        .css({
          background: "#00000080",
          width: 20
        })
        .siblings()
        .css({
          background: "#00000030",
          width: 10
        });
    }
  }

  initRect() {
    if (this.options.width && this.options.height) {
      $(".childrenWrapper .flex").css({
        width: this.options.width,
        height: this.options.height
      });
      $(".wrapper").css({
        width: this.options.width,
        height: this.options.height
      });
      $(".childrenWrapper").height(this.options.height);
    }
  }
}

let carousel = new Carousel("#app", {
  //during: 500,
  //direction: "vertical",
  slide: "ease",
  // width: 200,
  // height: 200
});

console.log(carousel);
