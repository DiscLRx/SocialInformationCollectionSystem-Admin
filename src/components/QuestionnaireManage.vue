<template>
    <a-table :columns="columns" :data-source="dataSource" bordered>
        <template #bodyCell="{ column, text, record }">
            <template v-if="['id', 'title', 'begin_date', 'end_date', 'enable'].includes(column.dataIndex)">
                <div>
                    <template v-if="editableData[record.id]">
                        <a-radio-group v-if="column.dataIndex==='enable'"
                                       v-model:value="editableData[record.id][column.dataIndex]"
                                       style="margin: -5px 0">
                            <a-radio-button value="y">是</a-radio-button>
                            <a-radio-button value="n">否</a-radio-button>
                        </a-radio-group>
                        <template v-else>
                            {{ text }}
                        </template>
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
            <template v-else-if="column.dataIndex === 'details'">
                <a-button type="primary" @click="showModal(record.id)">查看详情</a-button>
                <a-modal v-model:visible="modalVisible" v-model:aria-details="questionnaireDetails" width="1000px" title="问卷详细信息" destroyOnClose>
                    <a-descriptions :column="5" bordered>
                        <a-descriptions label="问卷ID" bordered>{{ questionnaireDetails.id }}</a-descriptions>
                        <a-descriptions label="问卷标题" :span="4" bordered>{{ questionnaireDetails.title }}</a-descriptions>
                        <a-descriptions label="可用" :span="1" bordered>{{ questionnaireDetails.enable ? '是' : '否' }}</a-descriptions>
                        <a-descriptions label="开始日期" :span="2" bordered>{{ ts2Date(questionnaireDetails.begin_date) }}</a-descriptions>
                        <a-descriptions label="截止日期" :span="2" bordered>{{ ts2Date(questionnaireDetails.begin_date) }}</a-descriptions>
                        <template v-for="question in questionnaireDetails.question">
                            <a-descriptions label="题目" :span="2" bordered>{{ question.content }}</a-descriptions>
                            <template v-if="['single','multi'].includes(question.type)">
                                <a-descriptions label="题型" bordered>{{ {'single':'单选','multi':'多选'}[question.type] }}</a-descriptions>
                                <a-descriptions label="选项" :span="2" bordered>
                                    <ol type="A">
                                        <template v-for="option in question.option.sort((a, b) => a.order < b.order ? -1 : 1)">
                                            <li>{{ option.content }}</li>
                                        </template>
                                    </ol>
                                </a-descriptions>
                            </template>
                            <template v-else-if="'text' === question.type">
                                <a-descriptions label="题型" :span="3" bordered>填空</a-descriptions>
                            </template>
                        </template>
                    </a-descriptions>
                    <template #footer>
                        <a-button @click="modalHandleOk" type="primary">确认</a-button>
                    </template>
                </a-modal>
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
import {ts2Date} from "@/assets/js/utils";

const columns = [
    {
        title: '问卷ID',
        dataIndex: 'id',
        width: '5%',
    },
    {
        title: '标题',
        dataIndex: 'title',
        width: '30%',
    },
    {
        title: '开始日期',
        dataIndex: 'begin_date',
        width: '15%',
    },
    {
        title: '截止日期',
        dataIndex: 'end_date',
        width: '15%',
    },
    {
        title: '可用',
        dataIndex: 'enable',
        width: '10%',
    },
    {
        title: '详细信息',
        dataIndex: 'details',
        width: '10%',
    },
    {
        title: '操作',
        dataIndex: 'operation',
    }
];

async function getQuestionnaires() {
    return await request({
        url: '/admin-api/questionnnaires',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Token': localStorage.getItem('token')
        }
    }).then((res) => {
        return res.data.data
    })
}

async function getQuestionnaireDetails(qnid) {
    return await request({
        url: `/admin-api/questionnnaires/${qnid}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Token': localStorage.getItem('token')
        }
    }).then(res => {
        return res.data.data
    })
}

async function updateQuestionnareEnable(qnid, enable){
    return await request({
        url: `/admin-api/questionnnaires/${qnid}`,
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Token': localStorage.getItem('token')
        },
        data: JSON.stringify({
            enable: enable
        })
    })
}

export default defineComponent({
    setup() {

        const dataSource = ref([])
        const save = ref()

        onMounted(async () => {
            getQuestionnaires().then((data)=>{
                data.forEach((qn, index, arr) => {
                    arr[index].enable = qn.enable ? 'y' : 'n'
                    let b_ts = arr[index].begin_date
                    arr[index].begin_date = ts2Date(b_ts)
                    let e_ts = arr[index].end_date
                    arr[index].end_date = ts2Date(e_ts)
                })
                dataSource.value = data
            })

            save.value = async key => {

                message.loading({
                    content: 'Loading...',
                    key,
                });

                let enable = editableData[key]['enable']
                enable = enable === 'y';

                updateQuestionnareEnable(editableData[key]['id'], enable).then((res)=>{
                    let code = res.data.code
                    if (code === 0) {
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
        };

        const cancel = key => {
            delete editableData[key];
        };

        const modalVisible = ref(false);
        const questionnaireDetails = ref();
        const showModal = async (qnid) => {
            questionnaireDetails.value = await getQuestionnaireDetails(qnid)
            modalVisible.value = true;
        };
        const modalHandleOk = () => {
            modalVisible.value = false;
        };

        return {
            dataSource,
            columns,
            editingKey: '',
            editableData,
            edit,
            save,
            cancel,
            modalVisible,
            showModal,
            modalHandleOk,
            questionnaireDetails,
            ts2Date
        };
    },
});
</script>
<style scoped>
.editable-row-operations a {
    margin-right: 8px;
}
</style>