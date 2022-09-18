<script>
	const WXAUTH = require('@/common/wxauth.js')
	export default {
		globalData: {
			h5Domain: 'https://xxxx.com',
			goLogin: false,
			subDomain: 'hdldzpd', // 改为你自己的专属域名
			merchantId: 29, // 改为你自己的商户ID
			version: '0.0.1',
			sysconfigkeys: 'mallName', // 需要批量读取的系统参数
			wxpayOpenAppId: 'xxxxx', // 微信开放平台的移动端应用appID
			openAlipayProvider: false, // 是否开通支付宝支付
			addressLevel: 3, // 省市区到3级还是4级，可选 3 或者 4
		},
		onLaunch: function() {
			// https://www.yuque.com/apifm/nu0f75/cdqz1n
			this.$wxapi.setMerchantId(this.globalData.merchantId)
			this.$wxapi.init(this.globalData.subDomain)
			const _this = this
			// 1.1.0版本之前关于http拦截器代码，已平滑移动到/common/http.interceptor.js中
			// 注意，需要在/main.js中实例化Vue之后引入如下(详见文档说明)：
			// import httpInterceptor from '@/common/http.interceptor.js'
			// Vue.use(httpInterceptor, app)
			// process.env.VUE_APP_PLATFORM 为通过js判断平台名称的方法，结果分别如下：
			/**
			 * h5，app-plus(nvue下也为app-plus)，mp-weixin，mp-alipay......
			 */
			this.checkForUpdate(); // 检查新版本
			this.queryConfigBatch();
		},
		onShow(e) {
			if (e && e.query && e.query.inviter_id) {
				this.$u.vuex('referrer', e.query.inviter_id)
			}
			if (e && e.query && e.query.kjJoinUid) {
				this.$u.vuex('kjJoinUid', e.query.kjJoinUid)
			}
			if (e && e.query && e.query.code) {
				// 微信登陆
				this.wxmpLogin(e.query.code)
				return
			} else {
				this.autoLogin()
			}
		},
		onHide: function() {
			// console.log('App Hide，app不再展现在前台')
		},
		onPageNotFound(e) {
			// 页面不存在 {path: '/1212', query: {a: '123'}, isEntryPage: true}
			console.error(e)
		},
		methods: {
			async queryConfigBatch() {
				const sysconfigkeys = this.globalData.sysconfigkeys
				if (!sysconfigkeys) {
					return
				}
				// https://www.yuque.com/apifm/nu0f75/dis5tl
				const res = await this.$wxapi.queryConfigBatch(sysconfigkeys)
				if (res.code == 0) {
					const sysconfigMap = {}
					res.data.forEach(config => {
						sysconfigMap[config.key] = config.value
					})
					this.$u.vuex('sysconfigMap', sysconfigMap)
				}
			},
			checkForUpdate() {
				// #ifdef MP
				const updateManager = uni.getUpdateManager();
				updateManager.onCheckForUpdate(function(res) {
					// 请求完新版本信息的回调
					console.log(res.hasUpdate);
				});
				updateManager.onUpdateReady(function(res) {
					uni.showModal({
						title: '更新提示',
						content: '新版本已经准备好，是否重启应用？',
						success(res) {
							if (res.confirm) {
								// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
								updateManager.applyUpdate();
							}
						}
					});

				});
				updateManager.onUpdateFailed(function(res) {
					// 新的版本下载失败
				});
				// #endif
				// #ifdef APP-PLUS
				// APP 自动更新
				// #endif
			},
			async autoLogin(force) {
				// 自动登陆
				// #ifdef MP-WEIXIN
				const isLogined = await WXAUTH.checkHasLogined()
				if (!isLogined) {
					await WXAUTH.authorize()
				}
				setTimeout(() => {
					uni.$emit('loginOK', {})
				}, 500)
				// #endif
			},
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "@/uni_modules/uview-ui/index.scss";

	.price-score {
		position: relative;
		display: flex;
		color: #e64340;
		font-size: 38rpx;

		text {
			padding: 0 6rpx;
			font-size: 28rpx;
		}

		.item {
			padding: 0 8rpx;
			display: flex;
			align-items: center;
		}

		.original {
			margin-left: 32rpx;
			color: #aaa;
			text-decoration: line-through
		}

		.score-icon {
			width: 28rpx;
			height: 28rpx;
			padding: 0 6rpx;
		}
	}

	.goods-title-tag {
		display: inline-flex !important;
		margin-right: 24rpx;
	}

	.goods-title {
		color: #333;
		font-size: 28rpx;
	}

	.pt16 {
		padding-top: 16rpx !important;
	}
	.submit-btn {
		padding: 32rpx;
	}
	.form-box {
		padding: 32rpx;
	}
	.mt32 {
		margin-top: 32rpx;
	}
	.label-title{
	  font-size:28rpx;
	  font-weight: bold;
	  color:#000000;
	  padding: 30rpx;
	  display: flex;
	  align-items: center;
	  .icon {
	    width: 6rpx;
	    height: 30rpx;
	    background: linear-gradient(360deg, #FFAD56 0%, #FF8A46 100%);
	    margin-right: 8rpx;
	  }
	}
</style>
