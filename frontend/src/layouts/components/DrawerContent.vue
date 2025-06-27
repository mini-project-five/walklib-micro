<script setup>
import {
  VerticalNavLink,
  VerticalNavSectionTitle,
} from '@layouts'
</script>

<template>
    <ul>
        <VerticalNavSectionTitle :item="{ heading: '사용자 관리' }" />
        <VerticalNavLink
            :item="{
                title: '사용자',
                to: '/users',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '포인트관리' }" />
        <VerticalNavLink
            :item="{
                title: '포인트',
                to: '/points',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '포인트목록',
                to: '/pointLists',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '구독 관리' }" />
        <VerticalNavLink
            :item="{
                title: '구독',
                to: '/subscriptions',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '책관리' }" />
        <VerticalNavLink
            :item="{
                title: '도서',
                to: '/books',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '도서 목록',
                to: '/bookLists',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '작가관리' }" />
        <VerticalNavLink
            :item="{
                title: '작가',
                to: '/authors',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '작가관리',
                to: '/authorManagements',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '작가 관리 화면',
                to: '/authorManagementViews',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: '작품 집필 관리' }" />
        <VerticalNavLink
            :item="{
                title: '원고',
                to: '/manuscripts',
            }"
        />
        <VerticalNavLink
            :item="{
                title: '원고 목록',
                to: '/manuscriptLists',
            }"
        />
        <VerticalNavSectionTitle :item="{ heading: 'AI 시스템 관리' }" />
        <VerticalNavLink
            :item="{
                title: 'AI',
                to: '/ais',
            }"
        />
    </ul>
</template>
