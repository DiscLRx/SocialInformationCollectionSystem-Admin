<template>
    <a-layout>
        <a-layout-content :style="{ height: '100vh', width: '100vw' }" class="sign-in-form-container">
            <a-form :model="formState"
                    name="basic"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    class="sign-in-form">
                <a-form-item label="用户名" name="username">
                    <a-input v-model:value="formState.username"/>
                </a-form-item>
                <a-form-item label="密码" name="password">
                    <a-input-password v-model:value="formState.password"/>
                </a-form-item>
                <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
                    <a-button type="primary" html-type="button" @click="doSignin">登录</a-button>
                </a-form-item>
            </a-form>
        </a-layout-content>
    </a-layout>


</template>
<script>
import {defineComponent, reactive} from 'vue';
import axios from "axios";
import router from "@/router";
import {message} from "ant-design-vue";

export default defineComponent({
    setup() {
        const formState = reactive({
            username: '',
            password: ''
        });

        async function doSignin() {
            localStorage.removeItem('token')
            await axios({
                url: '/admin-api/admin/auth',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    "username": formState.username,
                    "password": formState.password
                })
            }).then(res => {
                let code = res.data.code
                if (code === 0) {

                    let token = res.data.data.token
                    localStorage.setItem('token', token)

                    let redirect = router.currentRoute.value.query.redirect
                    if (redirect) {
                        router.push(redirect)
                    } else {
                        router.push('/')
                    }

                } else if (code === 12) {
                    message.warn({
                        content: res.data.data,
                        duration: 3
                    })
                } else {
                    message.warn({
                        content: '登录失败',
                        duration: 3
                    })
                }
            })
        }

        return {
            formState,
            doSignin
        };
    },
});
</script>
<style scoped>
.sign-in-form-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.sign-in-form {
    padding: 40px 50px 24px 50px;
    background-color: rgba(230, 230, 233, 1);
    margin-bottom: 10%;
    border-radius: 5px;
}
</style>