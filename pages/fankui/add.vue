<template>
	<view v-if="nickStatus != 0 && avatarUrlStatus != 0">
		<view v-if="nickStatus == 1" class="setnick">
			<view class="title">设置您的昵称</view>
			<view class="input">
				<u-input type="nickname" placeholder="如何称呼您？" v-model="nick" clearable focus inputAlign="center"></u-input>
			</view>
			<view class="btn">
				<u-button type="success" size="large" shape="circle" text="设置昵称" @click="saveNick"></u-button>
			</view>
		</view>
		<view v-else-if="avatarUrlStatus == 1" class="setnick">
			<view class="title">设置您的头像</view>
			<view class="input">
				<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
				  <image class="avatar" :src="avatarUrl" mode="aspectFill"></image>
				</button> 
			</view>
			<view class="btn">
				<u-button type="success" size="large" shape="circle" text="设置头像" @click="saveAvatar"></u-button>
			</view>
		</view>
		<view v-else-if="mobileStatus == 1" class="setnick">
			<view class="title">请先登陆</view>
			<view class="btn">
				<u-button type="success" size="large" shape="circle" text="一键登陆" openType="getPhoneNumber" @getphonenumber="getPhoneNumber"></u-button>
			</view>
		</view>
		<view v-else>
			<view class="form-box">
				<u-textarea v-model="content" clearable placeholder="请留下您的宝贵建议或意见～"></u-textarea>
				<view class="upload">
					<u-upload :fileList="fileList" maxCount="9" width="100" @afterRead="afterRead" @delete="deletePic" accept="image" multiple uploadText="上传图片"></u-upload>
				</view>
			</view>
			<view class="submit-btn">
				<u-button type="success" @click="submit">提交反馈</u-button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				nickStatus: 0, // 0 未查询，1 未设置昵称，2 已设置
				avatarUrlStatus: 0, // 0 未查询，1 未设置头像，2 已设置
				mobileStatus: 0, // 0 未判断； 1 未绑定手机好吗； 2 已绑定手机号码
				nick: undefined,
				avatarUrl: undefined,
				content: undefined,
				fileList: [],
				balance: 0.00,
				rules: {
					name: [{
						required: true,
						message: '不能为空',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					mobile: [{
						required: true,
						message: '不能为空',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					content: [{
						required: true,
						message: '不能为空',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
				},
				form: {
					name: null,
					mobile: null,
					wx: null,
					content: null,
				},
			}
		},
		created() {

		},
		mounted() {

		},
		onReady() {
			// this.$refs.uForm.setRules(this.rules)
			this._userDetail()
		},
		onLoad(e) {},
		onShow() {

		},
		methods: {
			async _userDetail() {
				// https://www.yuque.com/apifm/nu0f75/zgf8pu
				const res = await this.$wxapi.userDetail(this.token)
				if (res.code == 0) {
					if (res.data.base.nick) {
						this.nickStatus = 2
					} else {
						this.nickStatus = 1
					}
					if (res.data.base.avatarUrl) {
						this.avatarUrlStatus = 2
					} else {
						this.avatarUrlStatus = 1
					}
					if (res.data.base.mobile) {
						this.mobileStatus = 2
					} else {
						this.mobileStatus = 1
					}
				}
			},
			async saveNick() {
				if (!this.nick) {
					uni.showToast({
						title: '请输入昵称',
						icon: 'none'
					})
					return
				}
				// https://www.yuque.com/apifm/nu0f75/ykr2zr
				const res = await this.$wxapi.modifyUserInfo({
					token: this.token,
					nick: this.nick
				})
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				uni.showToast({
					title: '设置成功',
					icon:'success'
				})
				this.nickStatus = 2
			},
			onChooseAvatar(e) {
				this.avatarUrl = e.detail.avatarUrl
			},
			async saveAvatar() {
				if (!this.avatarUrl) {
					uni.showToast({
						title: '请选择头像',
						icon: 'none'
					})
					return
				}
				let res = await this.$wxapi.uploadFile(this.token, this.avatarUrl)
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				// https://www.yuque.com/apifm/nu0f75/ykr2zr
				res = await this.$wxapi.modifyUserInfo({
					token: this.token,
					avatarUrl: res.data.url
				})
				if (res.code != 0) {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
					return
				}
				uni.showToast({
					title: '设置成功',
					icon:'success'
				})
				this.avatarUrlStatus = 2
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
			async afterRead(event) {
				// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
				this.fileList = this.fileList.concat(event.file)
			},
			deletePic(event) {
				this.fileList.splice(event.index, 1)
			},
			async submit() {
				const extJsonStr = {}
				// 批量上传附件
				if (this.fileList) {
					for (let index = 0; index < this.fileList.length; index++) {
						const pic = this.fileList[index];
						const res = await this.$wxapi.uploadFile(this.token, pic.url)
						if (res.code == 0) {
							extJsonStr['file' + index] = res.data.url
						}
					}
				}
				const res = await this.$wxapi.addComment({
					token: this.token,
					type: 1,
					extJsonStr: JSON.stringify(extJsonStr),
					content: this.content
				})
				if (res.code == 0) {
					uni.showModal({
						showCancel: false,
						title: '成功',
						content: '提交成功',
						confirmText: '知道了',
						success: () => {
							uni.navigateBack()
						}
					})
				} else {
					uni.showToast({
						title: res.msg,
						icon: 'none'
					})
				}
			},
		}
	}
</script>
<style scoped lang="scss">
	.upload {
		margin-top: 32rpx;
	}
	.setnick {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		.title {
			color: #333;
			font-size: 58rpx;
			font-weight: bold;
			text-align: center;
		}
		.input {
			padding: 32rpx 64rpx;
		}
	}
	.btn {
		padding: 64rpx;
	}
</style>
