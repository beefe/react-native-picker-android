'use strict';
 
var React = require('react-native');
var { 
	StyleSheet, 
	PropTypes, 
	View, 
	Text, 
	Image,
	PixelRatio,
	Dimensions,
	PanResponder,
	processColor,
} = React;

var PickerAndroidItem = React.createClass({

	displayName: 'PickerAndroidItem',

	statics: {
		title: '<PickerAndroidItem>',
		description: 'this is PickerAndroidItem',
	},

	propTypes: {
		value: PropTypes.any,
		label: PropTypes.string,
	},

	render() {
		return null;
	},

});

var PickerAndroid = React.createClass({

	displayName: 'PickerAndroid',

	statics: {
		title: '<PickerAndroid>',
		description: 'this is PickerAndroid',
		item: PickerAndroidItem,
	},

	propTypes: {
		/**
		*	picker 值改变时执行。
		*/
		onValueChange: PropTypes.func,
		/**
		*	picker 默认值。
		*/
		selectedValue: PropTypes.any,
	},

	getInitialState() {
		return this._stateFromProps(this.props);
	},

	componentWillReceiveProps(nextProps) {
		this.setState(this._stateFromProps(nextProps));
	},

	_stateFromProps(props) {
		var selectedIndex = 0;
		var items = [];
		React.Children.forEach(props.children, (child, index) => {
			child.props.value === props.selectedValue && ( selectedIndex = index );
			items.push({value: child.props.value, label: child.props.label});
		});
		return { selectedIndex, items };
	},

	_move(dy) {
		var index = this.index;
		this.middleHeight = Math.abs(-index * 40 + dy);
		this.up && this.up.setNativeProps({
			style: {
				marginTop: (3 - index) * 30 + dy * .75,
			},
		});
		this.middle && this.middle.setNativeProps({
			style: {
				marginTop: -index * 40 + dy,
			},
		});
		this.down && this.down.setNativeProps({
			style: {
				marginTop: (-index - 1) * 30 + dy * .75,
			},
		});
	},

	_moveTo(index) {
		var _index = this.index;
		var diff = _index - index;
		var marginValue;
		var that = this;
		if(diff && !this.isMoving) {
			marginValue = diff * 40;
			this._move(marginValue);
			this.index = index;
			this._onValueChange();
		}
	},

	moveUp() {
		this._moveTo(Math.max(this.index - 1, 0));
	},

	moveDown() {
		this._moveTo(Math.min(this.index + 1, this.length - 1));
	},

	_handlePanResponderMove(evt, gestureState) {
		var dy = gestureState.dy, index = this.index;
		if(this.isMoving) {
			return;
		}
		// turn down
		if(dy > 0) {
			this._move(dy > this.index * 40 ? this.index * 40 : dy);
		}else{
			this._move(dy < (this.index - this.length + 1) * 40 ? (this.index - this.length + 1) * 40 : dy);
		}
	},

	_handlePanResponderRelease(evt, gestureState) {
		var middleHeight = this.middleHeight;
		this.index = middleHeight % 40 >= 20 ? Math.ceil(middleHeight / 40) : Math.floor(middleHeight / 40);
		this._move(0);
		this._onValueChange();
	},

	componentWillMount() {
		this._panResponder = PanResponder.create({
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
			onPanResponderRelease: this._handlePanResponderRelease,
			onPanResponderMove: this._handlePanResponderMove,
		});
		this.index = this.state.selectedIndex;
		this.length = this.state.items.length;
		this.isMoving = false;
	},

	componentWillUnmount() {
		this.timer && clearInterval(this.timer);
	},

	_renderItems(items) {
		//实际显示的内容不能是value，因为value是用来检测变更的(onValueChange)
		//某些场景的value有特殊用途，如级联菜单
		//最好单独定义，这里跟iOS一样使用了label
		//add by zooble @2015-12-10
		var upItems = [], middleItems = [], downItems = [];
		items.forEach((item, index) => {
			upItems[index] = (  <Text 
									style={[styles.upText, this.props.itemStyle]}
									onPress={() => {
										this._moveTo(index);
									}} >
									{item.label}
								</Text> );
			middleItems[index] = ( <Text style={[styles.middleText, this.props.itemStyle]}>{item.label}</Text> );
			downItems[index] = ( <Text 
									style={[styles.downText, this.props.itemStyle]}
									onPress={() => {
										this._moveTo(index);
									}} >
									{item.label}
								</Text> );
		});
		return { upItems, middleItems, downItems, };
	},

	_onValueChange() {
		//实际使用中onValueChange的事件回调函数，往往需要回传当前的value
		//add by zooble @2015-12-10
		this.props.onValueChange && this.props.onValueChange(this.state.items[this.index].value);
	},

	render() {
		var index = this.state.selectedIndex;
		var length = this.state.items.length;
		var items = this._renderItems(this.state.items);

		var upViewStyle = {
			marginTop: (3 - index) * 30, 
			height: length * 30, 
		};
		var middleViewStyle = {
			marginTop:  -index * 40, 
		};
		var downViewStyle = {
			marginTop: (-index - 1) * 30, 
			height:  length * 30, 
		};

		
		return (
			<View style={styles.container} {...this._panResponder.panHandlers}>

				<View style={styles.up}>
					<View style={[styles.upView, upViewStyle]} ref={(up) => { this.up = up }} >
						{ items.upItems }
					</View>
				</View>

				<View style={styles.middle}>
					<View style={[styles.middleView, middleViewStyle]} ref={(middle) => { this.middle = middle }} >
						{ items.middleItems }
					</View>
				</View>

				<View style={styles.down}>
					<View style={[styles.downView, downViewStyle]} ref={(down) => { this.down = down }} >
						{ items.downItems }
					</View>
				</View>

			</View>
		);
	},

});

var styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: null,
	},
	up: {
		height: 90, 
		overflow: 'hidden',
	},
	upView: {
		justifyContent: 'flex-start', 
		alignItems: 'center',
	},
	upText: {
		paddingTop: 0, 
		height: 30, 
		fontSize: 20, 
		color: '#000',
		opacity: .5,
		paddingBottom: 0, 
		marginTop: 0, 
		marginBottom: 0, 
	},
	middle: {
		height: 40, 
		overflow: 'hidden', 
		borderColor: '#aaa',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		width: Dimensions.get('window').width,
	},
	middleView: {
		height: 40, 
		justifyContent: 'flex-start', 
		alignItems: 'center',
	},
	middleText: {
		paddingTop: 0, 
		height: 40, 
		color: '#000',
		fontSize: 28, 
		paddingBottom: 0, 
		marginTop: 0, 
		marginBottom: 0, 
	},
	down: {
		height: 90, 
		overflow: 'hidden',
	},
	downView: {
		overflow: 'hidden', 
		justifyContent: 'flex-start', 
		alignItems: 'center',
	},
	downText: {
		paddingTop: 0, 
		height: 30, 
		fontSize: 16, 
		color: '#000',
		opacity: .5,
		paddingBottom: 0, 
		marginTop: 0, 
		marginBottom: 0, 
	},

});

module.exports = PickerAndroid;
