/* 后台管理系统-路由管理 */
import {
    BasicLayout,
    RouteView
} from '@/layouts';


/* 首页 */
// 无此页面
const Error = () =>
    import ( /* webpackChunkName: "Error" */ '@/views/comm/Error');
// 首页
const Home = () =>
    import ( /* webpackChunkName: "Home" */ '@/views/home/home');

// 视频
const Video = () =>
    import ( /* webpackChunkName: "video" */ '@/views/video/video');
// 视频互通
const PeerConnection = () =>
    import ( /* webpackChunkName: "video" */ '@/views/video/peerconnection');
// 视频互通
const PeerConnectionSDP = () =>
    import ( /* webpackChunkName: "video" */ '@/views/video/peerconnectionSDP');
// 一对一聊天室
const OneToOne = () =>
    import ( /* webpackChunkName: "video" */ '@/views/video/oneToOne');
// 聊天
const Chat = () =>
    import ( /* webpackChunkName: "video" */ '@/views/video/chat');
// 登录房间
const LoginRoom = () =>
    import ( /* webpackChunkName: "LoginRoom" */ '@/views/video/loginRoom');
// 文件
const File = () =>
    import ( /* webpackChunkName: "video" */ '@/views/video/file');
export default [{
    path: '/main',
    name: 'main',
    component: BasicLayout,
    children: [{
            path: 'error',
            name: 'error',
            component: Error
        },
        /* 首页管理 */
        {
            path: 'home',
            redirect: 'home/home',
            component: RouteView,
            children: [
                // 首页
                {
                    path: 'home',
                    name: 'home',
                    component: Home
                }
            ]
        },
        /* 视频 */
        {
            path: 'video',
            redirect: 'video/video',
            component: RouteView,
            children: [
                // 视频
                {
                    path: 'video',
                    name: 'video',
                    component: Video
                },
                // 视频互通
                {
                    path: 'peerConnection',
                    name: 'peerConnection',
                    component: PeerConnection
                },
                // 视频互通
                {
                    path: 'peerConnectionSDP',
                    name: 'peerConnectionSDP',
                    component: PeerConnectionSDP
                },
                // 视频互通
                {
                    path: 'oneToOne',
                    name: 'oneToOne',
                    component: OneToOne
                },
                // 登录房间
                {
                    path: 'loginRoom',
                    name: 'loginRoom',
                    component: LoginRoom
                },
                // 聊天
                {
                    path: 'chat/',
                    name: 'chat',
                    component: Chat
                },
                // 文件
                {
                    path: 'file',
                    name: 'file',
                    component: File
                }
            ]
        }
    ]
}];