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
    this.initPicker();
    this.initPrevNext();
    this.initOptions();
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
      child.appendTo(this.childrenWrapper);
    }
    let wrapperedChildren = $('.child');
    for (let i = 0; i < wrapperedChildren.length; i++) {
      let newChild = $(wrapperedChildren[i]);
      if (getWidth(newChild) < maxW || getHeight(newChild) < maxH) {
        let itemWrapper = $('<div></div>').addClass('child flex').width(maxW).height(maxH);
        newChild.wrap(itemWrapper);
      }
    }
    this.wrapper.addClass("wrapper");
    this.wrapper.css({
      height: maxH,
      width: maxW
    });
    if (this.options.during > 0) {
      this.wrapper.hover(
        e => this.stopPlay(),
        e => {
          this.autoPlay(this.options.during);
          this.childrenWrapper.off('mousemove')
        }
      );
    }
  }

  initOptions() {
    if (this.options.during && this.options.during > 0) {
      this.autoPlay(this.options.during);
    }
    //slide初始化
    switch (this.options.slide) {
      case 'bounce':
        this.childrenWrapper.css('transitionTimingFunction', 'cubic-bezier(.56,-0.77,.51,1.59)');
        break;
      case 'ease':
      case null:
      case undefined:
      default:
        this.childrenWrapper.css('transitionTimingFunction', 'ease');
    }
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
    } else {
      let offset = getWidth(this.wrapper) / 2 - getWidth(this.pickers) / 2;
      this.pickers.css("left", offset);
    }
  }

  initPrevNext() {
    if (this.options.direction && this.options.direction === "vertical") {} else {
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
    let startPoint = 0;
    let move = 0;
    this.wrapper.on('touchstart', e => {
      startPoint = e.targetTouches[0].pageX;
    })
    this.wrapper.on('touchmove', e => {
      let curPoint = e.targetTouches[0].pageX;
      move = (curPoint - startPoint) - (this.index * getWidth(this.wrapper));
      this.childrenWrapper.css('left', move);
    });
    this.wrapper.on('touchend', e => {
      //let endPoint = e.targetTouches[0].pageX;
      if (move > getWidth(this.wrapper) / 2 && this.index > 0) { //右滑=>后退
        this.index--;
        console.log('右滑', move, getWidth(this.wrapper) / 2)
      } else if (move < 0 && -move > getWidth(this.wrapper) / 2 && this.index < this.pickers.length) { //左滑=>前进
        this.index++;
        console.log('左滑', move, getWidth(this.wrapper) / 2)
      }
      console.log('???', move, getWidth(this.wrapper) / 2)
      this.toIndex();
    })
  }

  toIndex() {
    if (this.options.direction && this.options.direction === "vertical") {
      this.childrenWrapper.css({
        top: `-${getHeight(this.wrapper) * this.index}px`
      });
    } else {
      this.childrenWrapper.css({
        left: `-${getWidth(this.wrapper) * this.index}px`
      });
    }
    $(".pickBtn")
      .eq(this.index)
      .css("background", "#00000080")
      .siblings()
      .css("background", "#00000030");
  }
}

let carousel = new Carousel("#app", {
  //during: 1000,
  //direction: "vertical",
  slide: 'ease'
});

console.log(carousel);