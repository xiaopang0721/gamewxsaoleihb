/**
*   微信扫雷红包
*/
module gamewxsaoleihb.page {
    export class WxSaoLeiHBMapPage extends game.gui.base.Page {
        private _viewUI: ui.nqp.game_ui.wxsaoleihb.WXSaoLeiUI;
        private _arrHB: Array<any> = [];
        private _wxSaoLeiMgr: WxSaoLeiHBMgr;
        private _wxSaoLeiStory: WxSaoLeiHBStory;
        private _wxSaoLeiMapInfo: WxSaoLeiHBMapInfo;
        constructor(v: Game, onOpenFunc?: Function, onCloseFunc?: Function) {
            super(v, onOpenFunc, onCloseFunc);
            this._isNeedDuang = false;
            this._delta = 1000;
            this._asset = [
                PathGameTongyong.atlas_game_ui_tongyong + "hud.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "pai.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "general.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "touxiang.atlas",
                PathGameTongyong.atlas_game_ui_tongyong + "tuichu.atlas",
                DatingPath.atlas_dating_ui + "qifu.atlas",
                Path_game_wxSaoLeiHB.atlas_game_ui + "guize.atlas",
                Path_game_wxSaoLeiHB.atlas_game_ui + "hud.atlas",
                Path_game_wxSaoLeiHB.atlas_game_ui + "saolei.atlas",
            ];
        }

        // 页面初始化函数
        protected init(): void {
            this._viewUI = this.createView('game_ui.wxsaoleihb.WXSaoLeiUI');
            this.addChild(this._viewUI);
            if (!this._pageHandle) {
                this._pageHandle = PageHandle.Get("WxSaoLeiHBMapPage");//额外界面控制器
            }
            this._wxSaoLeiStory = this._game.sceneObjectMgr.story as WxSaoLeiHBStory;
            if (this._wxSaoLeiStory) {
                this._wxSaoLeiMgr = this._wxSaoLeiStory.wxSaoLeiHBMgr;
                this.onUpdateMapInfo();
            }

            this._viewUI.panel_hb.vScrollBarSkin = "";
            this._viewUI.panel_hb.vScrollBar.autoHide = true;
            this._viewUI.panel_hb.vScrollBar.elasticDistance = 100;
            this._viewUI.mouseThrough = true;
            //初始房间名字
            let mapLv = this._wxSaoLeiMapInfo.GetMapLevel();
            let index = WxSaoLeiHBMgr.ALL_GAME_ROOM_CONFIG_ID.indexOf(mapLv);
            if (index < 0) index = 0;
            this._viewUI.lb_map_name.text = WxSaoLeiHBMgr.GMAE_ROOME_NAME[index];
        }

        // 页面打开时执行函数
        protected onOpen(): void {
            super.onOpen();
            this.updateViewUI();
            this._viewUI.btn_share.on(LEvent.CLICK, this, this.onBtnClickWithTween)
            this._viewUI.btn_hbjl.on(LEvent.CLICK, this, this.onBtnClickWithTween)
            this._viewUI.btn_ye.on(LEvent.CLICK, this, this.onBtnClickWithTween)
            this._viewUI.btn_fhb.on(LEvent.CLICK, this, this.onBtnClickWithTween)
            this._viewUI.lb_yemx.on(LEvent.CLICK, this, this.onBtnClickWithTween)
            this._viewUI.lb_ok.on(LEvent.CLICK, this, this.onBtnClickWithTween)
            this._viewUI.box_fhb.on(LEvent.CLICK, this, this.onBtnClickWithTween)
            this._viewUI.btn_back.on(LEvent.CLICK, this, this.onBtnClickWithTween)
            this._viewUI.btn_more.on(LEvent.CLICK, this, this.onBtnClickWithTween)

            this._viewUI.btn_hb_close.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.btn_hb_open.on(LEvent.CLICK, this, this.onBtnClickWithTween);
            this._viewUI.rain_open.on(LEvent.CLICK, this, this.onBtnClickWithTween);

            this._viewUI.btn_add.on(LEvent.CLICK, this, this.onBtnClick);
            this._viewUI.btn_di1.on(LEvent.CLICK, this, this.onBtnClick);
            this._viewUI.btn_di2.on(LEvent.CLICK, this, this.onBtnClick);
            this._viewUI.finsh_check.on(LEvent.CLICK, this, this.onBtnClick);

            this._wxSaoLeiMgr.on(WxSaoLeiHBMgr.MAP_HB_INFO, this, this.updateHBdata);   //红包数据
            this._wxSaoLeiMgr.on(WxSaoLeiHBMgr.MAP_HB_LQ_INFO, this, this.openHBInfoPage);  //红包领取数据
        }

        //重置UI状态
        private updateViewUI(): void {
            this._viewUI.box_hb_open.visible = false;
            this._viewUI.box_ye.visible = false;
            this._viewUI.box_di1.visible = false;
            this._viewUI.box_di2.visible = true;
        }

        //弹出红包详情界面
        private openHBInfoPage(lq_datas: any): void {
            this._game.uiRoot.HUD.open(WxsaoleihbPageDef.PAGE_WXSLHB_HB_INFO, (page: WxSaoLeiHBInfoPage) => {
                page.setData(this._curHbData, lq_datas, WxSaoLeiHBInfoPage.TYPE_HB_INFO);
            })
        }

        //===========红包领取start==========
        public static readonly TYPE_HBY = 1;//红包雨
        public static readonly TYPE_GET_HB = 2;//领取红包
        public static readonly TYPE_NO_GET_HB = 2;//红包已领完
        private _curHbData: any;   //当前打开这个界面的红包数据
        initHBGetUI(type: number, hbData: any): void {
            this._curHbData = hbData;
            if (!hbData) return;
            this._viewUI.box_hb_open.visible = true;
            this._viewUI.hb_finsh.visible = type == WxSaoLeiHBMapPage.TYPE_NO_GET_HB;
            this._viewUI.hb_rain.visible = type == WxSaoLeiHBMapPage.TYPE_HBY;
            this._viewUI.hb_open.visible = type == WxSaoLeiHBMapPage.TYPE_GET_HB;
            switch (type) {
                case WxSaoLeiHBMapPage.TYPE_HBY:
                    this.updateHBRainUI(hbData);
                    break
                case WxSaoLeiHBMapPage.TYPE_GET_HB:
                    this.updateGetHBUI(hbData);
                    break
                case WxSaoLeiHBMapPage.TYPE_NO_GET_HB:
                    this.updateFinshHBUI(hbData);
                    break
            }
        }

        //红包领取
        private updateGetHBUI(hbData: any): void {
            this._viewUI.open_head.skin = TongyongUtil.getHeadUrl(hbData.head);
            this._viewUI.open_name.text = hbData.name;
            this._viewUI.open_hb_name.text = "恭喜发财,大吉大利";
            let ld_arr = hbData.ld_str.split(',');
            this._viewUI.open_ld.text = JSON.stringify(ld_arr);
        }

        //红包雨
        private updateHBRainUI(hbData): void {
            //红包剩余时间,先隐藏掉
            this._viewUI.hby_time.visible = false;
        }

        //红包领取完
        private updateFinshHBUI(hbData): void {
            this._viewUI.finsh_head.skin = TongyongUtil.getHeadUrl(hbData.head);
            this._viewUI.finsh_name.text = hbData.name;
        }
        //===========红包领取end==========
        private _isShowInfo = false;
        private onBtnClick(e: LEvent): void {
            switch (e.currentTarget) {
                case this._viewUI.btn_add:
                    this._isShowInfo = !this._isShowInfo;
                    this.updateDiBuUI();
                    break
                case this._viewUI.btn_di1:
                    this._viewUI.box_di2.visible = true;
                    this._viewUI.box_di1.visible = false;
                    break
                case this._viewUI.btn_di2:
                    this._viewUI.box_di2.visible = false;
                    this._viewUI.box_di1.visible = true;
                    this._viewUI.box_di1_down.visible = false;
                    this._viewUI.box_di1_up.y = 154;
                    this._viewUI.img_di1_bg.y = 144;
                    this._viewUI.img_di1_bg.height = 74;
                    break
                case this._viewUI.finsh_check:
                    //发送红包查询记录
                    this._game.network.call_wxsaoleihb_get_lqjl(this._curHbData.hb_id);
                    break
            }
        }

        private updateDiBuUI(): void {
            if (this._isShowInfo) {
                //显示下层
                this._viewUI.box_di1_down.visible = true;
                this._viewUI.box_di1_up.y = 31;
                this._viewUI.img_di1_bg.y = 18;
                this._viewUI.img_di1_bg.height = 207;
                this._viewUI.panel_hb.height = 1088;
            } else {
                this._viewUI.box_di1_down.visible = false;
                this._viewUI.box_di1_up.y = 154;
                this._viewUI.img_di1_bg.y = 144;
                this._viewUI.img_di1_bg.height = 74;
                this._viewUI.panel_hb.height = 962;
            }
            this._viewUI.panel_hb.vScrollBar.value = this._viewUI.panel_hb.vScrollBar.max;
        }

        //更新玩家数据
        updateMainInfo(): void {
            let mainPlayer: PlayerData = this._game.sceneObjectMgr.mainPlayer;
            if (!mainPlayer) return;
            let mainPlayerInfo = mainPlayer.playerInfo;
            this._viewUI.lb_ye.text = StringU.substitute("余额：{0}", mainPlayerInfo.money);
            //冻结

        }

        private onUpdateMapInfo(): void {
            let mapinfo = this._game.sceneObjectMgr.mapInfo;
            this._wxSaoLeiMapInfo = mapinfo as WxSaoLeiHBMapInfo;
            if (mapinfo) {

            }
        }


        /**按钮点击事件缓动完 回调 该做啥就做啥 */
        protected onBtnTweenEnd(e: any, target: any): void {
            let mainPlayer = this._game.sceneObjectMgr.mainPlayer;
            if (!mainPlayer) return;
            switch (target) {
                case this._viewUI.btn_share:
                    //微信分享
                    this._game.datingGame.isShare = true;
                    this._game.datingGame.shareContinueTime = Laya.timer.currTimer;
                    this._game.datingGame.wxShareQrcodeImg("", "", Web_operation_fields.WXSCENESESSION)
                    break
                case this._viewUI.btn_fhb:

                    break
                case this._viewUI.btn_hbjl:

                    break
                case this._viewUI.btn_ye:
                    this._viewUI.box_ye.visible = true;
                    break
                case this._viewUI.lb_yemx:
                    this._game.uiRoot.general.open(WxsaoleihbPageDef.PAGE_WXSLHB_YEMX);
                    break
                case this._viewUI.lb_ok:
                    this._viewUI.box_ye.visible = false;
                    break
                case this._viewUI.box_fhb:
                    this._game.uiRoot.general.open(WxsaoleihbPageDef.PAGE_WXSLHB_FAHB, () => {
                        this._wxSaoLeiMapInfo.GetMapLevel();
                    });
                    break
                case this._viewUI.btn_back:
                    this._game.sceneObjectMgr.leaveStory(true);
                    break
                case this._viewUI.btn_more:
                    //成员列表
                    // this._game.uiRoot.general.open(WxSaoLeiHBPageDef.PAGE_WXSLHB_FAHB);
                    break
                case this._viewUI.btn_hb_close:
                    this._viewUI.box_hb_open.visible = false;
                    break
                case this._viewUI.btn_hb_open:
                    //领取红包
                    //判断当前这个红包的状态,已结束则打开红包结束状态，否则发送领取红包协议

                    break
                case this._viewUI.rain_open:
                    //红包雨领取红包

                    break
            }
        }

        private _curDiffTime: number;
        update(diff: number) {
            super.update(diff);
        }

        //帧间隔心跳
        deltaUpdate() {

        }

        //------------------红包主界面操作start---------
        //红包数据更新
        private updateHBdata(type: number, info: any): void {
            let mainPlayer: PlayerData = this._game.sceneObjectMgr.mainPlayer;
            if (!mainPlayer) return;
            let mainUid = mainPlayer.GetUserId();
            let isSelf = info.uid == mainUid;
            //状态更新
            if (type == WxSaoLeiHBMgr.HB_ADD) {
                //新增 在末尾加
                this.addHB(info, isSelf, WxSaoLeiHBMapPage.MAIN_HB);
            } else if (type == WxSaoLeiHBMgr.HB_REMOVE) {
                //移除
                this.removeHB(info);
            } else if (type == WxSaoLeiHBMgr.HB_UPDATE) {
                //红包更新
                this.updateHB(info);
            } else if (type == WxSaoLeiHBMgr.HB_LQ_UPDATE) {
                //只有我领别人或者别人领我的红包,才需要加信息条
                //红包领取数据更新
                let lq_data: any;
                let lq_data_arr;
                if (info.lq_data) {
                    lq_data_arr = JSON.parse(info.lq_data);
                    lq_data = lq_data_arr[lq_data_arr.length - 1];
                }
                if (isSelf || (lq_data && lq_data.uid == mainUid))
                    this.addHB(info, isSelf, WxSaoLeiHBMapPage.MAIN_HB_LQ_INFO);
                //领完了在加一条
                if (isSelf && lq_data_arr.length == info.bao_num) {
                    //自己的红包领完了在加一条
                    this.addHB(info, isSelf, WxSaoLeiHBMapPage.MAIN_HB_LQ_INFO, WxSaoLeiHBMapPage.EXTRA_TYPE_FINSH);
                    //判断是否需要预中雷结算信息
                    if (info.type == WxSaoLeiHBMgr.TYPE_DUOLEI) {
                        this.addHB(info, isSelf, WxSaoLeiHBMapPage.MAIN_HB_LQ_INFO, WxSaoLeiHBMapPage.EXTRA_TYPE_ZL);
                    }
                }
            }
            this._viewUI.panel_hb.vScrollBar.value = this._viewUI.panel_hb.vScrollBar.max;
        }

        //新增红包
        private static readonly MAIN_HB: number = 1;    //红包
        private static readonly MAIN_HB_LQ_INFO: number = 2;   //红包信息
        public static readonly EXTRA_TYPE_FINSH: number = 1;    //红包已领完
        public static readonly EXTRA_TYPE_ZL: number = 2;    //预中雷信息结算
        private _hbUIY: number = 0;
        private _diffY: number = 12;
        addHB(hbData: any, isSelf: boolean = false, type: number, extraType: number = 0) {
            let uiHb: any;
            switch (type) {
                case WxSaoLeiHBMapPage.MAIN_HB:
                    if (!isSelf) {
                        uiHb = new HBLeft();
                        uiHb.x = 0;
                    } else {
                        uiHb = new HBRight();
                        uiHb.x = 240;
                    }
                    break
                case WxSaoLeiHBMapPage.MAIN_HB_LQ_INFO:
                    uiHb = new HBInfo(extraType);
                    break
            }
            uiHb.setData(this._game, hbData);
            uiHb.y = this._hbUIY;
            this._viewUI.panel_hb.addChild(uiHb);
            this._hbUIY += uiHb.height + this._diffY;
            this._arrHB.push(uiHb);
        }

        //移除红包
        removeHB(hbData: any) {
            let index = this.findHBUIByHBData(hbData);
            let removeUiHB = this._arrHB[index];
            let removeY: number = removeUiHB.y;
            removeUiHB.removeSelf();
            this._arrHB.splice(index, 1);
            //在调整在它之后的所有的位置
            let curUIY: number;
            for (let i = index; i < this._arrHB.length; i++) {
                if (curUIY != 0 && !curUIY) curUIY = removeY;
                let curUiHB = this._arrHB[i];
                let saveY = curUiHB.y;
                curUiHB.y = curUIY;
                curUIY = saveY;
            }
        }

        //更新红包
        updateHB(hbData: any) {
            let index = this.findHBUIByHBData(hbData);
            let uiHB = this._arrHB[index];
            uiHB.setData(this._game, hbData);
        }

        //查找到对应的红包ui
        private findHBUIByHBData(hbData: any): number {
            for (let i = 0; i < this._arrHB.length; i++) {
                let uiHB = this._arrHB[i];
                if (!uiHB) continue;
                let hb_data = uiHB.dataSource;
                if (!hb_data) continue;
                if (hb_data.hb_id == hbData.hb_id) {
                    return i;
                }
            }
        }
        //------------------红包主界面操作end---------
        public close(): void {
            this._wxSaoLeiMgr.off(WxSaoLeiHBMgr.MAP_HB_INFO, this, this.updateHBdata);
            this._wxSaoLeiMgr.off(WxSaoLeiHBMgr.MAP_HB_LQ_INFO, this, this.openHBInfoPage);
            if (this._viewUI) {
                this._game.stopAllSound();
                this._game.stopMusic();
            }
            super.close();
        }
    }
    class HBLeft extends ui.nqp.game_ui.wxsaoleihb.component.WXSaoLei_HB1UI {
        private _game: Game;
        private _data: any;
        private _lq_data: any;
        private _lq_data_self: any;
        private _player: PlayerData;
        private _playerInfo: any;
        constructor() {
            super();
        }
        setData(game: Game, data: any) {
            this._data = data;
            if (!data) return;
            this._player = this._game.sceneObjectMgr.mainPlayer;
            if (!this._player) return;
            this._playerInfo = this._player.playerInfo;

            this._lq_data = JSON.parse(this._data.lq_data);
            this.lb_name.text = this._data.name;
            this.img_head.skin = TongyongUtil.getHeadUrl(this._data.head);
            this.img_kuang.visible = false;
            this.img_light.visible = false;
            //是否是自己操作过的红包
            //预中雷，中雷，未中雷，已领完，已过期
            let isSelfOpt: boolean = false;
            for (let i = 0; i < this._lq_data.length; i++) {
                let cur_data = this._lq_data[i];
                if (cur_data.uid == this._playerInfo.GetUserId()) {
                    isSelfOpt = true;
                    this._lq_data_self = cur_data;
                }
            }
            //红包状态结束
            if (this._data.hb_data == 2) {
                let diffTime = Laya.timer.currTimer - this._data.create_time;
                let isLQFinsh = this._lq_data.length >= this._data.bao_num;
                let isTimeOut = diffTime > WxSaoLeiHBMgr.HB_TIME;
                this.img_di.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/btn_hb1.png";
                if (this._data.type == WxSaoLeiHBMgr.TYPE_DANLEI) {
                    this.img_hb.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/tu_hb.png";
                } else if (this._data.type == WxSaoLeiHBMgr.TYPE_DUOLEI) {
                    this.img_hb.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/tu_hb3.png";
                }
                if (isLQFinsh)
                    this.lb_status.text = "已领完";
                else {
                    if (isTimeOut)
                        this.lb_status.text = "已超时";
                }
            } else {
                this.img_di.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/btn_hb0.png";
                this.img_kuang.visible = true;
                this.ani1.play(0, true);
                //判断类型
                if (this._data.type == WxSaoLeiHBMgr.TYPE_DANLEI) {
                    this.img_hb.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/tu_hb2.png";
                } else if (this._data.type == WxSaoLeiHBMgr.TYPE_DUOLEI) {
                    this.img_light.visible = true;
                    this.ani2.play(0, true);
                    this.img_hb.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/tu_hb4.png";
                }
                if (isSelfOpt) {
                    //自己操作过
                    if (this._lq_data_self.is_zl) {
                        if (this._data.type == WxSaoLeiHBMgr.TYPE_DANLEI) {
                            this.lb_status.text = "中雷";
                        } else if (this._data.type == WxSaoLeiHBMgr.TYPE_DUOLEI) {
                            this.lb_status.text = "预中雷";
                        }
                    } else {
                        this.lb_status.text = "未中雷";
                    }
                } else {
                    //自己还没有操作过
                    this.lb_status.text = "";
                    this.box_main.on(LEvent.CLICK, this, this.onBtnLQ);
                }
            }
            //红包剩余
            this.lb_sy.text = StringU.substitute("剩余:{0}/{1}", this._lq_data.length, this._data.bao_num);
            //红包金额
            this.lb_money.text = this._data.money;
            //红包雷号
            this.lb_ld.text = this._data.ld_str;
            //倒计时
            Laya.timer.loop(1000, this, this.updateTime);
        }

        private updateTime(): void {
            let diffTime = Laya.timer.currTimer - this._data.create_time;
            let countDown = WxSaoLeiHBMgr.HB_TIME - diffTime;
            if (countDown < 0) {
                this.lb_time.text = "0秒";
            } else {
                this.lb_time.text = countDown.toString() + "秒";
            }
        }

        //领取红包
        private onBtnLQ(): void {
            if (this._data.hb_data == 2) {
                //发红包数据查询记录  红包已领完
                let page: WxSaoLeiHBMapPage = this._game.uiRoot.HUD.getPage(WxsaoleihbPageDef.PAGE_WXSLHB_MAP) as WxSaoLeiHBMapPage;
                if (page) {
                    page.initHBGetUI(WxSaoLeiHBMapPage.TYPE_NO_GET_HB, this._data);
                }
            } else {
                //未结束 发领取红包记录

            }
        }
    }
    class HBRight extends ui.nqp.game_ui.wxsaoleihb.component.WXSaoLei_HB2UI {
        private _game: Game;
        private _data: any;
        private _lq_data: any;
        private _lq_data_self: any;
        private _player: PlayerData;
        private _playerInfo: any;
        constructor() {
            super();
        }
        setData(game: Game, data: any) {
            this._data = data;
            if (!data) return;
            this._player = this._game.sceneObjectMgr.mainPlayer;
            if (!this._player) return;
            this._playerInfo = this._player.playerInfo;

            this._lq_data = JSON.parse(this._data.lq_data);
            this.lb_name.text = this._data.name;
            this.img_head.skin = TongyongUtil.getHeadUrl(this._data.head);
            this.img_kuang.visible = false;
            this.img_light.visible = false;
            //是否是自己操作过的红包
            //预中雷，中雷，未中雷，已领完，已过期
            let isSelfOpt: boolean = false;
            for (let i = 0; i < this._lq_data.length; i++) {
                let cur_data = this._lq_data[i];
                if (cur_data.uid == this._playerInfo.GetUserId()) {
                    isSelfOpt = true;
                    this._lq_data_self = cur_data;
                }
            }
            //红包状态结束
            if (this._data.hb_data == 2) {
                let diffTime = Laya.timer.currTimer - this._data.create_time;
                let isLQFinsh = this._lq_data.length >= this._data.bao_num;
                let isTimeOut = diffTime > WxSaoLeiHBMgr.HB_TIME;
                this.img_di.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/btn_hb1.png";
                if (this._data.type == WxSaoLeiHBMgr.TYPE_DANLEI) {
                    this.img_hb.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/tu_hb.png";
                } else if (this._data.type == WxSaoLeiHBMgr.TYPE_DUOLEI) {
                    this.img_hb.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/tu_hb3.png";
                }
                if (isLQFinsh)
                    this.lb_status.text = "已领完";
                else {
                    if (isTimeOut)
                        this.lb_status.text = "已超时";
                }
            } else {
                this.img_di.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/btn_hb0.png";
                this.img_kuang.visible = true;
                this.ani1.play(0, true);
                //判断类型
                if (this._data.type == WxSaoLeiHBMgr.TYPE_DANLEI) {
                    this.img_hb.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/tu_hb2.png";
                } else if (this._data.type == WxSaoLeiHBMgr.TYPE_DUOLEI) {
                    this.img_light.visible = true;
                    this.ani2.play(0, true);
                    this.img_hb.skin = Path_game_wxSaoLeiHB.ui_wxsaoleihb + "saolei/tu_hb4.png";
                }
                if (isSelfOpt) {
                    //自己操作过
                    if (this._lq_data_self.is_zl) {
                        if (this._data.type == WxSaoLeiHBMgr.TYPE_DANLEI) {
                            this.lb_status.text = "中雷";
                        } else if (this._data.type == WxSaoLeiHBMgr.TYPE_DUOLEI) {
                            this.lb_status.text = "预中雷";
                        }
                    } else {
                        this.lb_status.text = "未中雷";
                    }
                } else {
                    //自己还没有操作过
                    this.lb_status.text = "";
                    this.box_main.on(LEvent.CLICK, this, this.onBtnLQ);
                }
            }
            //红包剩余
            this.lb_sy.text = StringU.substitute("剩余:{0}/{1}", this._lq_data.length, this._data.bao_num);
            //红包金额
            this.lb_money.text = this._data.money;
            //红包雷号
            this.lb_ld.text = this._data.ld_str;
            //倒计时
            Laya.timer.loop(1000, this, this.updateTime);
        }

        private updateTime(): void {
            let diffTime = Laya.timer.currTimer - this._data.create_time;
            let countDown = WxSaoLeiHBMgr.HB_TIME - diffTime;
            if (countDown < 0) {
                this.lb_time.text = "0秒";
            } else {
                this.lb_time.text = countDown.toString() + "秒";
            }
        }

        //领取红包
        private onBtnLQ(): void {
            if (this._data.hb_data == 2) return;
            this._game.network.call_wxsaoleihb_opt(this._data.hb_id);
        }
    }
    class HBInfo extends ui.nqp.game_ui.wxsaoleihb.component.WXSaoLei_getUI {
        private _game: Game;
        private _data: any;
        private _wxsaoleihbMgr: WxSaoLeiHBMgr;
        private _extraType: number;
        constructor(extraType: number) {
            super();
            this._extraType = extraType;
        }
        setData(game: Game, data: any) {
            this._data = data;
            if (!data) return;
            let mainPlayer: PlayerData = this._game.sceneObjectMgr.mainPlayer;
            if (!mainPlayer) return;
            let story: WxSaoLeiHBStory = this._game.sceneObjectMgr.story;
            if (!story) return;
            this._wxsaoleihbMgr = story.wxSaoLeiHBMgr;
            let info = "";  //信息
            let last_lq_data: any;  //最后一条领取数据
            let lq_data_arr: any;   //领取数据组
            let ld_arr = JSON.parse(this._data.ld_str);             //雷点数组
            if (this._data.lq_data) {
                lq_data_arr = JSON.parse(this._data.lq_data);
            }
            if (!lq_data_arr) return;
            let pf_money: number = this._data.hb_data.type == WxSaoLeiHBMgr.TYPE_DANLEI ? this._wxsaoleihbMgr.LqDanLeiPFMoney(this._data) : this._wxsaoleihbMgr.LqDuoLeiPFMoney(this._data);
            if (this._extraType == 0) {
                //不是额外信息
                let mainUid = mainPlayer.GetUserId();
                let isSelf = this._data.uid == mainUid;
                last_lq_data = lq_data_arr[lq_data_arr.length - 1];
                let name = last_lq_data.name;
                let color = "#3b72fe";  //玩家颜色色值
                let zl_num = Number(last_lq_data.lq_money.substr(-1, 1));  //中雷号
                let lq_money = last_lq_data.lq_money;
                if (isSelf) {
                    //自己的红包别人领了 拿取最后一条的数据
                    if (last_lq_data.is_zl) {
                        if (this._data.type == WxSaoLeiHBMgr.TYPE_DANLEI) {
                            info = StringU.substitute("<span color='{0}'>{1}</span>玩家领取了您的红包,中雷{2}赔付{3}", color, name, zl_num, HtmlFormat.addHtmlColor(pf_money.toString(), TeaStyle.COLOR_RED));
                        } else if (this._data.type == WxSaoLeiHBMgr.TYPE_DUOLEI) {
                            info = StringU.substitute("<span color='{0}'>{1}</span>玩家领取了您的红包,预中雷{2}冻结{3}", color, name, zl_num, HtmlFormat.addHtmlColor(pf_money.toString(), TeaStyle.COLOR_RED));
                        }
                    } else {
                        info = StringU.substitute("<span color='{0}'>{1}</span>{0}玩家领取了您的红包");
                    }
                } else {
                    //领取了别人的红包
                    if (last_lq_data.is_zl) {
                        if (this._data.type == WxSaoLeiHBMgr.TYPE_DANLEI) {
                            info = StringU.substitute("您领取了<span color='{0}'>{1}</span>玩家的红包,获得{2},中雷{3}赔付{4}", color, name, HtmlFormat.addHtmlColor(lq_money.toString(), TeaStyle.COLOR_RED), zl_num, HtmlFormat.addHtmlColor(pf_money.toString(), TeaStyle.COLOR_RED));
                        } else if (this._data.type == WxSaoLeiHBMgr.TYPE_DUOLEI) {
                            info = StringU.substitute("您领取了<span color='{0}'>{1}</span>玩家领取了您的红包,获得{2},预中雷{3}冻结{4}", color, name, HtmlFormat.addHtmlColor(lq_money.toString(), TeaStyle.COLOR_RED), zl_num, HtmlFormat.addHtmlColor(pf_money.toString(), TeaStyle.COLOR_RED));
                        }
                    } else {
                        info = StringU.substitute("您领取了<span color='{0}'>{1}</span>玩家领取了您的红包,获得{2}", color, name, HtmlFormat.addHtmlColor(lq_money.toString(), TeaStyle.COLOR_RED));
                    }

                }
            } else {
                switch (this._extraType) {
                    case WxSaoLeiHBMapPage.EXTRA_TYPE_FINSH:
                        //红包已经领完了
                        info = "您的红包被领完"
                        break;
                    case WxSaoLeiHBMapPage.EXTRA_TYPE_ZL:
                        //中雷信息
                        let isZl = this._wxsaoleihbMgr.isYuZLJudge(lq_data_arr, this._data.ld_str);
                        let json_ld_arr = JSON.stringify(ld_arr);
                        let zl_arr = this._wxsaoleihbMgr.ZlShuCalculate(this._data);
                        let json_zl_arr = JSON.stringify(zl_arr);
                        if (isZl) {
                            //预中雷赔付
                            info = StringU.substitute("多雷结算,全部雷点{0},中雷雷点{1},总共获赔{2}元", json_ld_arr, json_zl_arr, pf_money * zl_arr.length);
                        } else {
                            //预中雷没有赔付
                            info = StringU.substitute("多雷结算,全部雷点{0}中雷雷点{1},免赔付", json_ld_arr, json_zl_arr);
                        }
                        break
                }
            }
            TextFieldU.setHtmlText(this.lb_info.text, info, false);//支持HTML
        }
    }
}