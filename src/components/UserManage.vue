<template>
    <a-table :columns="columns" :data-source="dataSource" bordered>
        <template #bodyCell="{ column, text, record }">
            <template v-if="['id','username','password','nickname','phone','enable'].includes(column.dataIndex)">
                <div>
                    <template v-if="['id'].includes(column.dataIndex)">
                        {{ text }}
                    </template>
                    <template v-else-if="editableData[record.id]">
                        <a-input v-if="column.dataIndex!=='enable'"
                                 v-model:value="editableData[record.id][column.dataIndex]"
                                 style="margin: -5px 0"/>
                        <a-radio-group v-else
                                       v-model:value="editableData[record.id][column.dataIndex]"
                                       style="margin: -5px 0">
                            <a-radio-button value="y">是</a-radio-button>
                            <a-radio-button value="n">否</a-radio-button>
                        </a-radio-group>
                    </template>
                    <template v-else>
                        <template v-if="column.dataIndex!=='enable'">
                            {{ text }}
                        </template>
                        <template v-else>
                            {{ text === 'y' ? '是' : '否' }}
                        </template>
                    </template>
                </div>
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations">
                    <span v-if="editableData[record.id]">
                        <a-popconfirm @confirm="save(record.id)" title="确认保存?" ok-text="是" cancel-text="否">
                            <a>保存</a>
                        </a-popconfirm>
                        <a-typography-link @click="cancel(record.id)">
                            取消
                        </a-typography-link>
                    </span>
                    <span v-else>
                        <a @click="edit(record.id)">编辑</a>
                    </span>
                </div>
            </template>
        </template>
    </a-table>
</template>
<script>
import {cloneDeep} from 'lodash-es';
import {defineComponent, onMounted, reactive, ref} from 'vue';
import {message} from 'ant-design-vue';
import request from "@/assets/js/auto-refresh-request";

const columns = [
    {
        title: 'UID',
        dataIndex: 'id',
        width: '5%',
    },
    {
        title: '用户名',
        dataIndex: 'username',
        width: '18%',
    },
    {
        title: '密码',
        dataIndex: 'password',
        width: '18%',
    },
    {
        title: '昵称',
        dataIndex: 'nickname',
        width: '18%',
    },
    {
        title: '电话',
        dataIndex: 'phone',
        width: '22%',
    },
    {
        title: '可用',
        dataIndex: 'enable',
        width: '8%',
    },
    {
        title: '操作',
        dataIndex: 'operation',
    }
];

async function getUsers() {
    return  await request({
        url: '/admin-api/users',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Token': localStorage.getItem('token')
        }
    }).then((res) => {
        return res.data.data
    })
}

async function updatetUser(id, data) {
    return await request({
        url: `/admin-api/users/${id}`,
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Token': localStorage.getItem('token')
        },
        data: JSON.stringify(data)
    })
}

export default defineComponent({
    setup() {

        const dataSource = ref([])
        const save = ref()

        onMounted(async () => {
            getUsers().then((data) => {
                data.forEach((user, index, arr) => {
                    arr[index].enable = user.enable ? 'y' : 'n'
                    arr[index].password = '********'
                })
                dataSource.value = data
            })


            save.value = async key => {

                message.loading({
                    content: 'Loading...',
                    key,
                });

                let password = editableData[key]['password'];
                if (password === '') {
                    password = null
                }

                let enable = editableData[key]['enable']
                enable = enable === 'y';

                updatetUser(
                    editableData[key]['id'],
                    {
                        username: editableData[key]['username'],
                        password: password,
                        nickname: editableData[key]['nickname'],
                        phone: editableData[key]['phone'],
                        enable: enable
                    }
                ).then((res) => {
                    let code = res.data.code
                    if (code === 0) {
                        editableData[key].password = '********'
                        Object.assign(dataSource.value.filter(item => key === item.id)[0], editableData[key]);
                        message.success({
                            content: '更新成功',
                            key,
                            duration: 3
                        })
                    } else {
                        message.error({
                            content: '更新失败',
                            key,
                            duration: 3
                        })
                    }
                })

                delete editableData[key];
            };
        })


        const editableData = reactive({});
        const edit = key => {
            editableData[key] = cloneDeep(dataSource.value.filter(item => key === item.id)[0]);
            editableData[key]['password'] = ''
        };

        const cancel = key => {
            delete editableData[key];
        };
        return {
            dataSource,
            columns,
            editingKey: '',
            editableData,
            edit,
            save,
            cancel,
        };
    },
});
</script>
<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>