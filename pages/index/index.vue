<template>
	<view class="container">
		<view class="user-info">
			<view class="avatar">
				<open-data type="userAvatarUrl"></open-data>
			</view>
			<view class="info">
				<view class="nick">
					<open-data type="userNickName"></open-data>
				</view>
				<view class="level">
					<u-icon name="level" color="#2979ff" size="28"></u-icon>
					<text>火锅食神 Lv.1</text>
				</view>
			</view>
		</view>
		<view class="box-container">
			<view class="title-box">
				<view class="title">火力值<text v-if="score != -1">({{ score }})</text></view>
				<view class="btn">
					<u-button v-if="mobileStatus == 1" openType="getPhoneNumber" @getphonenumber="getPhoneNumber" type="primary" text="答题+5" shape="circle" plain></u-button>
					<u-button v-if="mobileStatus == 2" type="primary" text="答题+5" shape="circle" plain @click="dati"></u-button>
				</view>
			</view>
			<view class="profile2">火力值可以免费兑换本店菜品～</view>
			<view class="h32"></view>
		</view>
		<view class="app-name">订座排队小程序</view>
		<view class="box-container">
			<view class="title-box">
				<view class="title">订订座</view>
				<view class="btn">
					<u-button type="primary" text="聚一下" shape="circle" plain @click="selectshop"></u-button>
				</view>
			</view>
			<view class="profile1">上次相聚，1246天前</view>
			<view class="profile2">2019年4月20日</view>
			<view class="profile2">城西银泰店</view>
			<view class="h32"></view>
		</view>
		<view class="box-container">
			<view class="title-box">
				<view class="title">排排号</view>
				<view class="btn">
					<u-button type="primary" text="拿个号" shape="circle" plain @click="selectshop"></u-button>
				</view>
			</view>
			<view class="user-info2">
				<image class="avatar" src="https://dcdn.it120.cc/2022/09/18/e1726cdd-5811-482a-b4b8-394c4515961a.jpg" mode="aspectFill"></image>
				<view class="info">
					<view class="nick">
						6月20日 22:09 From
					</view>
					<view class="nick">
						王铁柱的妹妹
					</view>
				</view>
			</view>
			<view class="h32"></view>
			
			<view class="profile2">别问，问就是最爱脆脆毛肚～</view>
			<view class="h32"></view>
		</view>
		<view class="date">
			<view class="day">17</view>
			<view class="month-year">9.2022</view>
		</view>
		<view class="fankui" @click="fankui">
			用户反馈
		</view>
	</view>
</template>



<script>
	const dayjs = require('dayjs')
	export default {
		data() {
			return {
				mobileStatus: 0, // 0 未判断； 1 未绑定手机好吗； 2 已绑定手机号码
				score: -1, // 积分
			}
		},
		onLoad(e) {
			this._userDetail()
			this.userAmount()
			uni.$on('loginOK', data => {
				this._userDetail()
				this.userAmount()
			})
		},
		onShow() {
			
		},
		onShareAppMessage() {
			return {
				title: '订座排队小程序',
				path: '/pages/index/index?inviter_id=' + this.uid
			}
		},
		methods: {
			async _userDetail() {
				// https://www.yuque.com/apifm/nu0f75/zgf8pu
				const res = await this.$wxapi.userDetail(this.token)
				if (res.code == 0) {
					if (res.data.base.mobile) {
						this.mobileStatus = 2
					} else {
						this.mobileStatus = 1
					}
				}
			},
			async userAmount() {
				// https://www.yuque.com/apifm/nu0f75/wrqkcb
				const res = await this.$wxapi.userAmount(this.token)
				if (res.code == 0) {
					this.score = res.data.score
				}
			},
			async getPhoneNumber(e) {
				if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
					console.error(e)
					return
				}
				const res = await this.$wxapi.bindMobileWxappV2(this.token, e.detail.code)
				if (res.code == 0) {
					uni.showToast({
						title: '登陆成功',
						icon: 'success',
						duration: 2000
					})
					this.$u.vuex('mobile', res.data)
					this.mobileStatus = 2
				} else {
					uni.showModal({
						title: '提示',
						content: res.msg,
						showCancel: false
					})
				}
			},
			async dati() {
				// 判断今日是否已经答题
				const res = await this.$wxapi.voteGroups({
					token: this.token,
					pageSize: 1
				})
				if (res.code == 0) {
					const item = res.data.result[0]
					if (item.dateAdd.indexOf(dayjs().format('YYYY-MM-DD')) != -1) {
						uni.showToast({
							title: '您今天已完成答题～',
							icon: 'none'
						})
						return
					}
				}
				uni.navigateTo({
					url: '/pages/dati/index'
				})
			},
			async selectshop() {
				// 判断有没有订过座
				const res = await this.$wxapi.yuyueMyJoinLogs({
					token: this.token
				})
				if (res.code == 0) {
					const item = res.data.result[0]
					if (item.status < 2) {
						uni.navigateTo({
							url: '/pages/dingzuo/success'
						})
						return
					}
				}
				uni.navigateTo({
					url: '/pages/shop/select'
				})
			},
			fankui() {
				uni.navigateTo({
					url: '/pages/fankui/index'
				})
			},
		}
	}
</script>
<style scoped lang="scss">
	.box-container {
		width: 622rpx;
		margin-left: 64rpx;
		margin-top: 32rpx;
		border-radius: 16rpx;
		box-shadow: 2rpx 2rpx 8px #ddd;
		background-color: #fff;
		.title-box {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 32rpx;
			.title {
				font-size: 38rpx;
				font-weight: bold;
				font-style:italic;
				text {
					color: #e64340;
				}
			}
		}
		.profile1 {
			padding: 24rpx 32rpx;
			color: #e4a450;
		}
		.profile2 {
			padding: 0rpx 32rpx;
			color: #666;
		}
	}
	.app-name {
		box-sizing: border-box;
		width: 100vw;
		padding: 32rpx 64rpx 0rpx 64rpx;
		text-align: right;
		font-size: 52rpx;
		font-weight: bold;
	}
	.user-info2 {
		padding: 0 32rpx;
		display: flex;
		align-items: center;
		.avatar {
			width: 88rpx;
			height: 88rpx;
			border-radius: 50%;
			overflow: hidden;
			flex-shrink: 0;
		}
		.info {
			margin-left: 32rpx;
			.nick {
				font-size: 32rpx;
				color: #666;
			}
		}
	}
	.date {
		padding: 64rpx 120rpx;
		.day {
			font-size: 78rpx;
			font-weight: bold;
		}
		.month-year {
			color: #333;
		}
	}
	.fankui {
		width: 88rpx;
		height: 88rpx;
		background-color: #eee;
		position: fixed;
		right: 32rpx;
		bottom: 88rpx;
		text-align: center;
		padding: 12rpx;
		border-radius: 50%;
		font-size: 30rpx;
		color: #333;
		font-weight: bold;
		box-shadow: 2rpx 2rpx 8px #ddd;
	}
</style>
