<template>
	<view>
		<view class="btn">
			<u-button type="primary" icon="edit-pen" size="large" shape="circle" text="我来说一下" @click="add"></u-button>
		</view>
		<!-- <view class="space"></view>
		<u-cell title="我的反馈" isLink></u-cell> -->
		
		<page-box-empty v-if="!list" title="暂无用户反馈" sub-title="您来说两句,抢个沙发吧～" :show-btn="false" />
		
		<block v-for="(item,index) in list">
			<view class="space"></view>
			<view class="list">
				<u-image lazyLoad :showMenuByLongpress="false" :src="item.commentUserInfo.avatarUrl" width="88rpx" height="88rpx"></u-image>
				<view class="info-box">
					<view class="nick">{{ item.commentUserInfo.nick }}</view>
					<view class="txt">{{ item.content }}</view>
					<view v-if="item.picList && item.picList.length > 0" class="picList">
						<u-album :urls="item.picList" :maxCount="100" multipleSize="175rpx"></u-album>
					</view>
					<view class="time">{{ item.dateAdd }}</view>
				</view>
			</view>
		</block>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: undefined,
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
			this.commentListV2()
		},
		onShareAppMessage() {
			return {
				title: '订座排队小程序',
				path: '/pages/index/index?inviter_id=' + this.uid
			}
		},
		methods: {
			add() {
				uni.navigateTo({
					url: '/pages/fankui/add'
				})
			},
			async commentListV2() {
				const res = await this.$wxapi.commentListV2({
					page: 1,
					pageSize: 100,
					showExtJson: true
				})
				if (res.code == 0) {
					res.data.result.forEach(ele => {
						ele.extJson = res.data.extJsonMap[ele.id]
						if (ele.extJson) {
							const picList = []
							Object.keys(ele.extJson).forEach(aaa => {
								picList.push(ele.extJson[aaa])
							})
							ele.picList = picList
						}
					})
					this.list = res.data.result
				}
			}
		}
	}
</script>
<style scoped lang="scss">
	.btn {
		padding: 64rpx 32rpx;
	}
	.space {
		width: 100vw;
		height: 24rpx;
		background-color: #eee;
	}
	.list {
		padding: 32rpx;
		display: flex;
		.info-box {
			flex: 1;
			padding-left: 32rpx;
			.nick {
				color: #666;
			}
			.txt {
				color: #333;
				margin-top: 8rpx;
				line-height: 52rpx;
			}
			.time {
				color: #999;
				margin-top: 16rpx;
			}
		}
	}
	.picList {
		margin-top: 16rpx;
	}
</style>