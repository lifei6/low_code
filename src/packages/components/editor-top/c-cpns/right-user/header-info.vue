<template>
  <div class="header-info">
    <div class="operation">
      <span>
        <el-icon>
          <bell />
        </el-icon>
      </span>
      <span>
        <el-icon>
          <ChatDotRound />
        </el-icon>
      </span>
      <span>
        <span class="dot"></span>
        <el-icon>
          <Postcard />
        </el-icon>
      </span>
    </div>
    <div class="info">
      <el-dropdown>
        <span class="user-info">
          <el-avatar
            :size="30"
            class="avatar"
            src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fblog%2F202109%2F02%2F20210902112930_d6c28.thumb.400_0.jpg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1700577878&t=3902ecd9c4b2ce6df26f178cfbfdeb38"
          />
          <span class="name">抱猫</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-icon>
                <CircleCloseFilled />
              </el-icon>
              退出系统
            </el-dropdown-item>
            <el-dropdown-item divided>
              <el-icon>
                <InfoFilled />
              </el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item>
              <el-icon>
                <Unlock />
              </el-icon>
              修改密码
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import {
  ElIcon,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElAvatar,
} from "element-plus";
export default {
  name: "header-info",
  components: {
    ElIcon,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ElAvatar,
  },
};
</script>

<style scoped lang="scss">
.header-info {
  flex: 1;
  margin-right: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.operation {
  display: inline-flex;
  margin-right: 20px;

  span {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 35px;

    &:hover {
      background: #f2f2f2;
    }

    i {
      font-size: 20px;
    }

    .dot {
      position: absolute;
      top: 3px;
      right: 3px;
      z-index: 10;
      width: 6px;
      height: 6px;
      background: red;
      border-radius: 100%;
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;

  .name {
    margin-left: 8px;
  }
}

.info {
  :global(.el-dropdown-menu__item) {
    line-height: 36px !important;
    padding: 6px 22px;
  }
}
</style>
