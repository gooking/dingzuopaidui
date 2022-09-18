import Vue from 'vue'
import App from './App'
import WXAPI from 'apifm-uniapp'

// vuex
import store from './store'

// 引入全局uView
import uView from '@/uni_modules/uview-ui'

import mixin from './common/mixin'

Vue.prototype.$store = store

Vue.config.productionTip = false

App.mpType = 'app'

Vue.use(uView)

Vue.prototype.$wxapi = WXAPI

// 引入uView提供的对vuex的简写法文件
let vuexStore = require('@/store/$u.mixin.js');
Vue.mixin(vuexStore);

// #ifdef MP
// 引入uView对小程序分享的mixin封装
const mpShare = require('@/uni_modules/uview-ui/libs/mixin/mpShare.js')
Vue.mixin(mpShare)
// #endif

Vue.mixin(mixin)

const app = new Vue({
    store,
    ...App
})

app.$mount()
