<template>
	<page-box-empty v-if="maxRecords == 0" title="暂无题目" sub-title="当前题库没有题目～" :show-btn="false" />
	<view v-else class="container">
		<!-- 自定义后退按钮 -->
		<view v-if="hasBack && backBakTop" class="back" :style="'top:' + backBakTop + ';height:' + backBakHeight"
			@click="goback">
			<u-icon name="arrow-left" size="48rpx"></u-icon>
		</view>
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
			<view class="guize" @click="guize">
				活动规则
			</view>
		</view>
		<view class="box-container">
			<view class="txt">{{ curRecord.title }}</view>
			<view class="num"><text>{{ curIndex + 1 }}</text>/{{ maxRecords }}</view>
		</view>
		<view class="h32"></view>
		<view v-for="(item,index) in curRecord.items" class="btn">
			<view v-if="showResult">
				<u-button v-if="item.isBest" type="success" size="large" shape="circle" :text="item.title"></u-button>
				<u-button v-else-if="item.id == curAnswer.id && !curAnswer.isBest" type="error" size="large" shape="circle" :text="item.title"></u-button>
				<u-button v-else type="warning" size="large" shape="circle" disabled plain :text="item.title"></u-button>
			</view>
			<u-button v-else type="warning" size="large" shape="circle" plain :text="item.title" @click="submit(item)"></u-button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 自定义后退按钮
				hasBack: false,
				backBakTop: 0,
				backBakHeight: 0,
				// 题库信息
				categoryId: undefined,
				curIndex: 0,
				okRecords: 0, // 回答正确的数量
				maxRecords: -1,
				list: undefined, // 题目列表
				curRecord: undefined, // 当前的题目
				curAnswer: undefined, // 当前选择的答案对象
				showResult: false, // 是否显示结果
				voteItemContent: {}, // 保存题目和答案的关系
			}
		},
		created() {

		},
		mounted() {

		},
		onReady() {

		},
		onLoad(e) {
			this.hasBack = getCurrentPages().length > 1
			// #ifdef MP-WEIXIN
			const custom = wx.getMenuButtonBoundingClientRect()
			console.log(custom);
			this.backBakTop = (custom.top) + 'px'
			this.backBakHeight = (custom.height) + 'px'
			// #endif
			this.voteItems()
		},
		onShow() {

		},
		onShareAppMessage(e) {
			return {
				title: '',
				path: ''
			}
		},
		methods: {
			goback() {
				console.log('goback');
				uni.showToast({
					title: 'sss'
				})
				uni.navigateBack()
			},
			guize() {
				uni.navigateTo({
					url: '/pages/about/about?key=datiguize'
				})
			},
			async voteItems() {
				let res = await this.$wxapi.cmsCategories()
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					this.maxRecords = 0
					return
				}
				const cmsCategories = res.data
				this.categoryId = cmsCategories[0].id
				res = await this.$wxapi.voteItems({
					pageSize: 100,
					status: 0,
					categoryId: this.categoryId, // 读取第一个题库，这里可以做成随机获取题库
					orderBy: 'idAsc',
					showItems: true
				})
				if (res.code == 0) {
					this.showResult = false
					this.curIndex = 0
					this.maxRecords = res.data.totalRow
					this.list = res.data.result
					this.curRecord = res.data.result[0]
				} else {
					this.maxRecords = 0
				}
			},
			submit(item) {
				this.voteItemContent[item.voteId] = {
					items: [item.id]
				}
				this.curAnswer = item
				this.showResult = true
				if (item.isBest) {
					// 打对了
					this.okRecords++
				}
				if (this.curIndex == this.maxRecords - 1) {
					console.log('全部回答完了，提交答案');
					this.voteCategory()
					return
				}
				// 下一题
				setTimeout(() => {
					this.showResult = false
					this.curRecord = this.list[++this.curIndex]
				}, 1000);
			},
			async voteCategory() {
				const res = await this.$wxapi.voteCategory({
					token: this.token,
					categoryId: this.categoryId,
					content: JSON.stringify(this.voteItemContent)
				})
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				uni.showModal({
					title: '答题完成',
					content: '恭喜您，答对 '+ this.okRecords +' 题，明日再战！',
					showCancel: false,
					confirmText: '返回首页',
					success: () => {
						uni.navigateBack()
					}
				})
			}
		}
	}
</script>
<style scoped lang="scss">
	.guize {
		box-shadow: 2rpx 2rpx 8px #ddd;
		background-color: linear-gradient;
		position: absolute;
		right: 0;
		bottom: 0;
		padding: 8rpx 16rpx;
		background: linear-gradient(90deg, #FFAD56 0%, #FF8A46 100%);
		border-radius: 32rpx 0 0 32rpx;
		font-size: 26rpx;
		color: #FFF;
	}

	.box-container {
		width: 622rpx;
		margin-left: 64rpx;
		margin-top: 64rpx;
		border-radius: 16rpx;
		box-shadow: 2rpx 2rpx 8px #ddd;
		background-color: #fff;
		padding: 64rpx 32rpx;
		box-sizing: border-box;
		.txt {
			font-weight: bold;
			font-size: 32rpx;
			line-height: 54rpx;
		}
		.num {
			text {
				color: #e64340;
			}
			color: #666;
			text-align: right;
			margin-top: 64rpx;
		}
	}
	.btn {
		padding: 32rpx 64rpx;
	}
</style>
