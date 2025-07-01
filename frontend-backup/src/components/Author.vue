<template>
    <div>
        <Number
            label="AuthorId"
            v-model="value.authorId"
            :editMode="editMode"
        />
        <String
            label="AuthorName"
            v-model="value.authorName"
            :editMode="editMode"
        />
        <String
            label="Email"
            v-model="value.email"
            :editMode="editMode"
        />
        <String
            label="Introduction"
            v-model="value.introduction"
            :editMode="editMode"
        />
        <Number
            label="AuthorPassword"
            v-model="value.authorPassword"
            :editMode="editMode"
        />
        <String
            label="RealName"
            v-model="value.realName"
            :editMode="editMode"
        />
        <AuthorRegisterStatus
            offline
            label="AuthorRegisterStatus"
            v-model="value.authorRegisterStatus"
            :editMode="editMode"
            @change="change"
        />
        <ManuscriptId
            offline
            label="원고 ID"
            v-model="value.manuscriptId"
            :editMode="editMode"
            @change="change"
        />
        <v-row class="ma-0 pa-0">
            <v-spacer></v-spacer>
            <v-btn width="64px" color="primary" @click="save">
                저장
            </v-btn>
        </v-row>
    </div>
</template>


<script>
import BaseEntity from './base-ui/BaseEntity.vue'

export default {
    name: 'Author',
    mixins:[BaseEntity],
    components:{
    },
    
    data: () => ({
        path: "authors",
        value: {
        }
    }),
    created(){
    },
    computed:{
    },
    methods: {
    },
}
</script>
