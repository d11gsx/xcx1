/**
 * 监听元素是否出现在屏幕
 * @param { String } elName 所在的节点
 * @param { String } attr 需要获取的属性值
 *  {
 *      dataset    // 节点的dataset
 *      width      // 节点的宽度
 *      height     // 节点的高度
 *      scrollLeft // 节点的水平滚动位置
 *      scrollTop  // 节点的竖直滚动位置
 *      scrollX    // 节点 scroll-x 属性的当前值
 *      scrollY    // 节点 scroll-y 属性的当前值
 *
 *      // 此处返回指定要返回的样式名
 *      res.margin
 *      res.backgroundColor
 *      res.context    // 节点对应的 Context 对象
 * }
 * @param { Boolean } isComponent 是否在组建内使用
 * 
 * @return {Function} 一个promise
 */

function listenEltoScreen({
  elName = '',
  attr = '',
  value = '',
  isComponent = {}
} = {}) {
  return new Promise((resolve) => {
    const query = !isComponent ? wx.createIntersectionObserver() : this.createIntersectionObserver()

    query.relativeToViewport({
      [attr]: value
    }).observe(elName, (res) => {
      resolve(res)
    })
  })
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 图片链接
    src: {
      type: String,
      value: ''
    },

    // 是否触发懒加载(暂不支持动态修改 触发懒加载)
    lazy: {
      type: Boolean,
      value: true
    },

    // 是否为图片
    isImage: {
      type: Boolean,
      value: true
    },

    // 触发懒加载的阀值
    threshold: {
      type: Number,
      value: 90
    },

    // 触发懒加载的方向
    direction: {
      type: String,
      value: 'bottom'
    },
    // 是否壁纸显示
    isWall: {
      type: Boolean,
      value: false
    },
    // 图片属性
    imgMode: {
      type: String,
      value: 'aspectFill'
    },

    // 视频壁纸
    show_fullscreen: {
      type: Boolean,
      value: false
    },
    show_play: {
      type: Boolean,
      value: false
    },
    controls: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    click() {
      this.triggerEvent('click', this.data.src)
    }
  },
  ready() {
    if (!this.data.lazy) return

    // 监听 元素是否有距离屏幕的情况
    if (this.data.isImage) {
      // 图片
      listenEltoScreen.bind(this)({
        elName: '.fengrui-img',
        attr: this.data.direction,
        value: this.data.threshold,
        isComponent: true
      }).then(() => {
        console.log("图片监听懒加载")
        this.setData({
          show: true
        })
      })
    } else {
      // 视频
      listenEltoScreen.bind(this)({
        elName: '.wall-video',
        attr: this.data.direction,
        value: this.data.threshold,
        isComponent: true
      }).then(() => {
        console.log("视频监听懒加载")
        this.setData({
          show: true
        })
      })
    }

  },
  onPageScroll(e) {
    console.log(e)
  }
})