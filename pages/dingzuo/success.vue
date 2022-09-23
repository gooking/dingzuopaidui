<template>
	<view>
		<view class="box-container">
			<view class="title">{{ extJson['订座门店'] }}</view>
			<u-cell-group>
				<u-cell title="就餐时间" :value="extJson['就餐时间']"></u-cell>
				<u-cell title="就餐人数" :value="extJson['就餐人数'] + '人'"></u-cell>
				<u-cell title="顾客信息" :value="extJson['联系人'] + ' ' + extJson['联系电话']"></u-cell>
				<u-cell title="门店地址" :label="shopInfo.address"></u-cell>
			</u-cell-group>
		</view>
		<view class="btn">
			<u-button type="error" size="large" shape="circle" text="取消订座" @click="yuyueJoinDelete"></u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				joinInfo: undefined,
				shopInfo: undefined,
				extJson: {}
			}
		},
		created() {
		
		},
		mounted() {
			
		},
		onReady() {
			
		},
		onLoad(e) {
			this.yuyueMyJoinLogs()
		},
		onShow() {

		},
		methods: {
			async yuyueMyJoinLogs() {
				const res = await this.$wxapi.yuyueMyJoinLogs({
					token: this.token
				})
				if (res.code == 0) {
					this.joinInfo = res.data.result[0]
					this.yuyueMyJoinInfo(this.joinInfo.id)
				}
			},
			async yuyueMyJoinInfo(joinId) {
				const res = await this.$wxapi.yuyueMyJoinInfo(this.token, joinId)
				if (res.code == 0) {
					this.extJson = res.data.extJson
					this.shopSubdetail(this.extJson['门店ID'])
				}
			},
			async shopSubdetail(shopId) {
				const res = await this.$wxapi.shopSubdetail(shopId)
				if (res.code == 0) {
					this.shopInfo = res.data.info
				}
			},
			async yuyueJoinDelete(item) {
				uni.showModal({
					title: '请确认',
					content: '确定要取消吗？',
					success: res => {
						if (res.confirm) {
							this._yuyueJoinDelete(item)
						}
					}
				});
			},
			async _yuyueJoinDelete() {
				const res = await this.$wxapi.yuyueJoinDelete(this.token, this.joinInfo.id)
				if (res.code != 0) {
					uni.$u.toast(res.msg)
				} else {
					uni.showToast({
						title: '已取消',
						icon: 'success'
					})
					setTimeout(function() {
						uni.reLaunch({
							url: '/pages/index/index'
						})
					}, 1000)
				}
			}
		}
	}
</script>
<style scoped lang="scss">
	.box-container {
		width: 686rpx;
		margin-left: 32rpx;
		margin-top: 32rpx;
		border-radius: 16rpx;
		box-shadow: 2rpx 2rpx 8px #ddd;
		background-color: #fff;
		padding: 64rpx 32rpx;
		box-sizing: border-box;

		.title {
			font-size: 38rpx;
			font-weight: bold;
			padding-bottom: 32rpx;
			padding-left: 16rpx;
		}
	}
	.btn {
		padding: 64rpx 32rpx;
	}
</style>