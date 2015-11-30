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

	_handlePanResponderGrant(evt, gestureState) {
		// this.up && this.up.setNativeProps({
		// 	style: {
		// 		backgroundColor: 'blue',
		// 	},
		// });
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

	_handlePanResponderMove(evt, gestureState) {
		var dy = gestureState.dy, index = this.index;
		// turn down
		if(dy > 0) {
			this._move(dy > this.index * 40 ? this.index * 40 : dy);
		}else{
			this._move(dy < -(this.length - this.index - 1) * 40 ? -(this.length - this.index) * 40 : dy);
		}
	},

	_handlePanResponderRelease(evt, gestureState) {
		var middleHeight = this.middleHeight;
		this.index = middleHeight % 40 >= 20 ? Math.ceil(middleHeight / 40) : Math.floor(middleHeight / 40);
		this._move(0);
	},

	_handlePanResponderEnd(evt, gestureState) {
		// this.backMarginTop += gestureState.dy;
	},

	componentWillMount() {
		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponder: (evt, gestureState) => true,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
			onMoveShouldSetPanResponder: (evt, gestureState) => true,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
			onPanResponderGrant: this._handlePanResponderGrant,
			onPanResponderRelease: this._handlePanResponderRelease,
			onPanResponderMove: this._handlePanResponderMove,
			onPanResponderEnd: this._handlePanResponderEnd,
		});
		// this.backMarginTop = 0;
		this.index = this.state.selectedIndex;
		this.length = this.state.items.length;
	},

	componentDidMount() {
		/**
		*	组件初次渲染之后立刻调用，仅执行一次
		*/
	},

	componentWillUnmount() {
		/**
		*	组件销毁之前调用
		*/
	},

	_renderItems(items) {
		var upItems = [], middleItems = [], downItems = [];
		items.forEach((item, index) => {
			upItems[index] = ( <Text style={styles.upText}>{item}</Text> );
			middleItems[index] = ( <Text style={styles.middleText}>{item}</Text> );
			downItems[index] = ( <Text style={styles.downText}>{item}</Text> );
		});
		return { upItems, middleItems, downItems, };
	},

	_onValueChange() {
		this.props.onValueChange && this.props.onValueChange(this.index);
	},

	render() {
		// 透明层 覆盖 
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
					<View 
						style={[styles.upView, upViewStyle]} 
						ref={(up) => { this.up = up }} >
						{ items.upItems }
					</View>
				</View>

				<View style={styles.middle}>
					<View style={[styles.middleView, middleViewStyle]} ref={(middle) => { this.middle = middle }} >
						{ items.middleItems }
					</View>
				</View>

				<View style={styles.down}>
					<View style={styles.downView} ref={(down) => { this.down = down }} >
						{ items.downItems }
					</View>
				</View>

				{/**<View 
					style={{ width: Dimensions.get('window').width - 100, height: 240, position: 'absolute', top: 0, left: 0, backgroundColor: '#000', opacity: 0.2, }}
					{...this._panResponder.panHandlers} />*/}

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
		backgroundColor: '#fff', 
		justifyContent: 'flex-start', 
		alignItems: 'center',
	},
	upText: {
		paddingTop: 0, 
		height: 30, 
		fontSize: 16, 
		paddingBottom: 0, 
		marginTop: 0, 
		marginBottom: 0, 
	},
	middle: {
		height: 40, 
		overflow: 'hidden', 
		borderColor: '#ddd',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		width: Dimensions.get('window').width,
		// backgroundColor: 'red', 
	},
	middleView: {
		height: 40, 
		justifyContent: 'flex-start', 
		alignItems: 'center',
	},
	middleText: {
		paddingTop: 0, 
		height: 40, 
		fontSize: 30, 
		paddingBottom: 0, 
		marginTop: 0, 
		marginBottom: 0, 
	},
	down: {
		height: 90, 
		overflow: 'hidden',
	},
	downView: {
		backgroundColor: '#fff', 
		overflow: 'hidden', 
		justifyContent: 'flex-start', 
		alignItems: 'center',
	},
	downText: {
		paddingTop: 0, 
		height: 30, 
		fontSize: 16, 
		paddingBottom: 0, 
		marginTop: 0, 
		marginBottom: 0, 
	},

});

module.exports = PickerAndroid;
