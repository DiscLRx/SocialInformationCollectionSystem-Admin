<template>
    <a-layout>
        <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible>
            <div class="logo" v-show="showLogo">
                社会信息收集系统
            </div>
            <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
                <a-menu-item key="1" @click="route(1)">
                    <user-outlined />
                    <span>用户管理</span>
                </a-menu-item>
                <a-menu-item key="2" @click="route(2)">
                    <copy-outlined />
                    <span>问卷管理</span>
                </a-menu-item>
            </a-menu>
        </a-layout-sider>
        <a-layout :style="{ height: '100vh' }">
            <a-layout-header style="background: #fff; padding: 0">
                <menu-unfold-outlined v-if="collapsed" class="trigger" @click="() => {collapsed = !collapsed; showLogo = !collapsed;}" />
                <menu-fold-outlined v-else class="trigger" @click="() => {collapsed = !collapsed; showLogo = !collapsed;}" />
            </a-layout-header>
            <a-layout-content :style="{ margin: '24px 16px', padding: '24px', background: '#fff', overflowY: 'auto'}">
              <RouterView />
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>
<script>
import { UserOutlined, CopyOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
import { defineComponent, ref } from 'vue';
import router from "@/router";
export default defineComponent({
    components:{
        UserOutlined,
        CopyOutlined,
        MenuUnfoldOutlined,
        MenuFoldOutlined
    },
    setup() {
        function route(key){
            const matcher = {
                1: '/user-manage',
                2: '/questionnaire-manage'
            }
            router.push(matcher[key])
        }
        return {
            selectedKeys: ref(['1']),
            collapsed: ref(false),
            showLogo: ref(true),
            route
        };
    },
});
</script>
<style>
.ant-layout {
    min-height: 100% !important;
}

.trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
}

.trigger:hover {
    color: #1890ff;
}

.logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.3);
    margin: 16px;
    color: #d8d8d8;
    font-family: "Microsoft YaHei UI", sans-serif;
    font-size: 16px;
    text-align: center;
    line-height: 32px;
    letter-spacing: 1px;

}

.site-layout .site-layout-background {
    background: #fff;
}

.site-name{
    background-color: rgb(100,100,120);
}
</style>