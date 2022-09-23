<template>
	<view>
		<u-form ref="uForm" label-width="140rpx" :model="form">
			<view class="box-container">
				<view class="title">联系信息</view>
				<u-form-item label="订座人" required prop="nick">
					<u-input v-model="form.nick" clearable placeholder="请输入您的姓名"></u-input>
				</u-form-item>
				<u-form-item label="性别" @click="showSex = true;" required>
					<u-radio-group v-model="form.sex" placement="row">
						<u-radio activeColor="#5ac725" name="男" label="男"></u-radio>
						<u-radio activeColor="#5ac725" name="女" label="女" customStyle="margin-left: 32rpx"></u-radio>
					</u-radio-group>
				</u-form-item>
				<u-form-item label="联系电话" required prop="mobile">
					<u-input v-model="form.mobile" clearable type="number" placeholder="请输入您手机号码"></u-input>
				</u-form-item>
			</view>
			<view class="box-container">
				<view class="title">就餐信息</view>
				<u-form-item label="就餐时间" required prop="time" @click="showDatetimePicker = true">
					<u-input v-model="form.time" readonly placeholder="请选择就餐时间"></u-input>
					<u-icon slot="right" name="arrow-right" customStyle="margin-left:16rpx"></u-icon>
					<u-datetime-picker ref="datetimePicker" title="选择就餐时间" :show="showDatetimePicker" v-model="datetimePickerVal"
					:filter="timefilter" mode="datetime" :minDate="minDate" :maxDate="maxDate" @cancel="showDatetimePicker = false" @confirm="datetimeSelect"></u-datetime-picker>
				</u-form-item>
				<u-form-item label="就餐人数" required prop="number">
					<view class="number">
						<u-number-box v-model="form.number"></u-number-box>
					</view>
				</u-form-item>
			</view>
			<view class="box-container">
				<view class="title">特殊要求</view>
				<view class="tags">
					<view v-for="(item,index) in tags" class="item">
						<u-tag :text="item.name" :plain="!item.select" size="large" shape="circle" @click="selectTag(index)"></u-tag>
					</view>
				</view>
				<view class="remark">
					<u-textarea v-model="form.remark" placeholder="如有其他要求,请告诉我们" ></u-textarea>
				</view>
			</view>
			<view class="btn">
				<u-button type="success" size="large" shape="circle" text="立即预定" @click="submit"></u-button>
			</view>
		</u-form>
	</view>
</template>

<script>
	const dayjs = require('dayjs')
	export default {
		data() {
			return {
				shopId: undefined,
				shopName: undefined,
				rules: {
					nick: [{
						required: true,
						message: '请输入您的姓名',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					sex: [{
						required: true,
						message: '请选择性别',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					mobile: [{
						required: true,
						message: '请输入您手机号码',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
					time: [{
						required: true,
						message: '请选择就餐时间',
						// 可以单个或者同时写两个触发验证方式 
						trigger: ['change', 'blur'],
					}],
				},
				form: {
					nick: null,
					sex: '男',
					mobile: null,
					time: null,
					remark: null,
					number: 2,
				},
				showDatetimePicker: false,
				datetimePickerVal: Number(new Date()),
				minDate: Number(new Date()),
				maxDate: Number(new Date()) + 3600000*24*30, // 30天
				tags: [
					{
						name: '靠近小料台',
						select: false
					},
					{
						name: '通风凉快',
						select: false
					},
					{
						name: '宽敞',
						select: false
					},
					{
						name: '大碗',
						select: false
					},
					{
						name: '红酒杯',
						select: false
					},
					{
						name: '白酒杯',
						select: false
					},
					{
						name: '醒酒器',
						select: false
					},
					{
						name: '宝宝餐具',
						select: false
					},
					{
						name: '宝宝椅',
						select: false
					}
				]
			}
		},
		created() {

		},
		mounted() {

		},
		onReady() {
			this.$refs.uForm.setRules(this.rules)
			this.$refs.datetimePicker.setFormatter(this.formatter)
		},
		onLoad(e) {
			this.shopId = e.shopId
			this.shopName = e.shopName
		},
		onShow() {

		},
		methods: {
			timefilter(type, value) {
				if (type == 'minute') {
					return value.filter(v => { return v % 10 == 0 })
				}
				return value
			},
			formatter(type, value) {
				if (type === 'year') {
					return `${value}年`
				}
				if (type === 'month') {
					return `${value}月`
				}
				if (type === 'day') {
					return `${value}日`
				}
				if (type === 'hour') {
					return `${value}点`
				}
				if (type === 'minute') {
					return `${value}分`
				}
				return value
			},
			datetimeSelect(e) {
				this.form.time = dayjs(e.value).format("MM月DD日HH点mm分")
				this.showDatetimePicker = false
			},
			selectTag(index) {
				const item = this.tags[index]
				item.select = !item.select
				this.tags.splice(index, 1, item)
			},
			submit() {
				this.$refs.uForm.validate().then(res => {
					this._submit()
				}).catch(errors => {
					uni.$u.toast('信息未填写完整')
				})
			},
			async _submit() {
				// 读取预约项目数据
				let res = await this.$wxapi.yuyueItems()
				if (res.code == 700) {
					uni.$u.toast('暂未开启订座')
					return
				}
				if (res.code != 0) {
					uni.$u.toast(res.msg)
					return
				}
				const yuyueItem = res.data.result[0] // 预约项目
				const selectTags = this.tags.filter(ele => ele.select)
				const _selectTags = []
				selectTags.forEach(ele => {
					_selectTags.push(ele.name)
				})
				const extJsonStr = {
					'门店ID': this.shopId,
					'订座门店': this.shopName,
					'联系人': this.form.nick,
					'性别': this.form.sex,
					'联系电话': this.form.mobile,
					'就餐时间': this.form.time,
					'就餐人数': this.form.number,
					'备注': this.form.remark ? this.form.remark : '',
				}
				if (_selectTags) {
					extJsonStr['特殊要求'] = _selectTags.join()
				}
				res = await this.$wxapi.yuyueJoin({
					token: this.token,
					yuyueId: yuyueItem.id,
					extJsonStr: JSON.stringify(extJsonStr),
					remark: ''
				})
				if (res.code != 0) {
					uni.$u.toast(res.msg)
					return
				}
				uni.redirectTo({
					url: '/pages/dingzuo/success'
				})
			},
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
			font-style: italic;
			padding-bottom: 32rpx;
		}
	}

	.btn {
		padding: 64rpx 32rpx;
	}
	.number {
		display: flex;
		flex-direction: row-reverse;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		.item {
			margin: 32rpx 32rpx 0 0;
		}
	}
	.remark {
		margin-top: 64rpx;
	}
</style>
