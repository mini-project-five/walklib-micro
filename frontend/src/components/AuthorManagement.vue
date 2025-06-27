<template>
    <div>
        <Number
            label="ManagementId"
            v-model="value.managementId"
            :editMode="editMode"
        />
        <Number
            label="UserId"
            v-model="value.userId"
            :editMode="editMode"
        />
        <Number
            label="ReviewerId"
            v-model="value.reviewerId"
            :editMode="editMode"
        />
        <Date
            label="ReviewedAt"
            v-model="value.reviewedAt"
            :editMode="editMode"
        />
        <ManagementStatus
            offline
            label="ManagementStatus"
            v-model="value.managementStatus"
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
    name: 'AuthorManagement',
    mixins:[BaseEntity],
    components:{
    },
    
    data: () => ({
        path: "authorManagements",
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
