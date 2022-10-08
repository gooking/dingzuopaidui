<template>
	<view v-if="apiok">
		<view class="search-box">
			<u-search placeholder="输入关键字搜索门店" v-model="kw" :showAction="false" @search="search"></u-search>
		</view>
		<page-box-empty v-if="!shops" title="暂无门店" sub-title="暂无满足条件的门店数据～" :show-btn="false" />
		<view v-for="(item,index) in shops" :key="index" class="box-container">
			<view class="title-box">
				<view class="title">{{ item.name }}<text>{{ item.distance }}km</text></view>
				<u-icon name="phone-fill" size="48rpx" color="#FF8A46" @click="calmobile(item.linkPhone)"></u-icon>
			</view>
			<view class="address">{{ item.address }}</view>
			<view class="btns">
				<view class="item">
					<u-button type="warning" shape="circle" plain text="订座" @click="dingzuo(item)"></u-button>
				</view>
				<view class="item">
					<u-button type="success" shape="circle" plain text="取号" @click="dingzuo(item)"></u-button>
				</view>
			</view>
		</view>
		<view class="h32"></view>
		<view class="h32"></view>
	</view>
</template>

<script>
	const dayjs = require('dayjs')
	const WXAUTH = require('@/common/wxauth.js')
	export default {
		data() {
			return {
				kw: '',
				latitude: '',
				longitude: '',
				shops: undefined,
				apiok: false
			}
		},
		created() {

		},
		mounted() {

		},
		onReady() {

		},
		onLoad(e) {
			
		},
		onShow() {
			uni.showLoading({
				
			})
			wx.getFuzzyLocation({
				type: 'wgs84', //wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
				success: (res) => {
					console.log(res);
					this.latitude = res.latitude
					this.longitude = res.longitude
					this.fetchShops(res.latitude, res.longitude, '')
				},
				fail: e => {
					console.error(e)
					WXAUTH.checkAndAuthorize('scope.userFuzzyLocation')
					this.apiok = true
				},
				complete: () => {
					uni.hideLoading()
				}
			})
		},
		onShareAppMessage(e) {
			return {
				title: '',
				path: ''
			}
		},
		methods: {
			async fetchShops(latitude, longitude, kw) {
				uni.showLoading({
					
				})
				// https://www.yuque.com/apifm/nu0f75/vvgeq9
				const res = await this.$wxapi.fetchShops({
					curlatitude: latitude,
					curlongitude: longitude,
					nameLike: kw
				})
				wx.hideLoading()
				if (res.code == 0) {
					res.data.forEach(ele => {
						ele.distance = ele.distance.toFixed(3) // 距离保留3位小数
					})
					this.shops = res.data
				} else {
					this.shops = null
				}
				this.apiok = true
			},
			search(kw) {
				this.fetchShops(this.latitude, this.longitude, kw)
			},
			calmobile(phoneNumber) {
				uni.makePhoneCall({
					phoneNumber
				})
			},
			async dingzuo(item) {
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
					url: '/pages/dingzuo/submit?shopId=' + item.id + '&shopName=' + item.name
				})
			},
		}
	}
</script>
<style scoped lang="scss">
.search-box {
	padding: 16rpx;
}
.box-container {
	width: 686rpx;
	margin-left: 32rpx;
	margin-top: 32rpx;
	border-radius: 16rpx;
	box-shadow: 2rpx 2rpx 8px #ddd;
	background-color: #fff;
	padding: 64rpx 32rpx;
	box-sizing: border-box;
	.title-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		.title {
			font-weight: bold;
			font-size: 34rpx;
			text {
				margin-left: 16rpx;
				font-size: 28rpx;
				color: #333;
			}
		}
	}
	.address {
		margin-top: 16rpx;
		color: #999;
	}
	.btns {
		display: flex;
		justify-content: space-between;
		margin-top: 48rpx;
		.item {
			width: 45%;
		}
	}
}
.shop-box {
	margin-top: 32rpx;
}
</style>
