<template>
    <div>
        <Number
            label="UserId"
            v-model="value.userId"
            :editMode="editMode"
        />
        <String
            label="Email"
            v-model="value.email"
            :editMode="editMode"
        />
        <Number
            label="UserPassword"
            v-model="value.userPassword"
            :editMode="editMode"
        />
        <String
            label="UserName"
            v-model="value.userName"
            :editMode="editMode"
        />
        <Boolean
            label="IsKtCustomer"
            v-model="value.isKtCustomer"
            :editMode="editMode"
        />
        <String
            label="Role"
            v-model="value.role"
            :editMode="editMode"
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
    name: 'User',
    mixins:[BaseEntity],
    components:{
    },
    
    data: () => ({
        path: "users",
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
