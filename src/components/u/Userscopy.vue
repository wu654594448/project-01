<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable @clear="getuserlist" v-model="queryinfo.query">
            <el-button @click="getuserlist" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="qwe = true">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="alist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
            v-model="scope.row.mg_state"
            @change="statechange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="alter(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini" @click="deletefor(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"
              @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @current-change="CurrentChange"
        @size-change="Sizechange"
        :current-page="queryinfo.pagenum"
        :page-size="queryinfo.pagesize"
        :page-sizes="[1, 2, 5, 10]"
        layout="total, prev, pager, next, sizes, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

<!-- 添加用户 -->
    <el-dialog
    title="添加用户"
    :visible.sync="qwe"
    width="50%"
    @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form
      :model="addForm"
      :rules="addFormRules"
      ref="addFormRef"
      label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="qwe = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

<!-- 修改信息 -->
    <el-dialog
    title="修改用户信息"
    :visible.sync="alterwin"
    width="50%"
    @close="altDialogClosed">
      <!-- 内容主体区域 -->
      <el-form
      :model="altForm"
      :rules="altFormRules"
      ref="altFormRef"
      label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="altForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="altForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="altForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="alterwin = false">取 消</el-button>
        <el-button type="primary" @click="altUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
    title="分配角色"
    :visible.sync="setroledialogVisible"
    width="50%"
    @close="setroledialogClosed">
      <div>
        <p>当前的用户： {{userInfo.username}}</p>
        <p>当前的角色： {{userInfo.role_name}}</p>
      </div>
      <el-select v-model="selectroleId" placeholder="请选择">
        <el-option
          v-for="item in roleList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id">
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setroledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    var checkMobile = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      alist: [],
      total: 0,
      // total: 0,
      qwe: false,
      alterwin: false,
      setroledialogVisible: false,
      userInfo: {},
      roleList: [],
      selectroleId: '',
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      altForm: {
        username: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      altFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getuserlist()
  },
  methods: {
    async getuserlist() {
      const { data: coll } = await this.$http.get('users', { params: this.queryinfo })
      if (coll.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.alist = coll.data.users
      this.total = coll.data.total
    },
    Sizechange(newSize) {
      this.queryinfo.pagesize = newSize
      this.getuserlist()
    },
    CurrentChange(newpage) {
      this.queryinfo.pagenum = newpage
      this.getuserlist()
    },
    async statechange(kaiguan) {
      const { data: res } = await this.$http.put(`users/${kaiguan.id}/state/${kaiguan.mg_state}`)
      if (res.meta.status !== 200) {
        kaiguan.mg_state = !kaiguan.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功！')
    },

    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.getuserlist()
    },
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(this.$refs)
        console.log(valid)
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm)

        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败！')
        }

        this.$message.success('添加用户成功！')
        // 隐藏添加用户的对话框
        this.qwe = false
        // 重新获取用户列表数据
        this.getuserlist()
      })
    },
    async alter (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询用户信息失败！')
      }
      this.altForm = res.data
      this.alterwin = true
    },
    altDialogClosed() {
      this.$refs.altFormRef.resetFields()
      this.getuserlist()
    },
    altUser() {
      this.$refs.altFormRef.validate(async (valid) => {
        if (!valid) return
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.put('users/' + this.altForm.id, {
          email: this.altForm.email,
          mobile: this.altForm.mobile
        })

        if (res.meta.status !== 201) {
          this.$message.error('更新失败！')
        }

        this.$message.success('添加用户成功！')
        // 隐藏添加用户的对话框
        this.alterwin = false
        // 重新获取用户列表数据
        this.getuserlist()
      })
    },
    // async deletefor(id) {
    //   const abc = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).catch(err => err)
    //   console.log(abc)
    //   if (abc !== 'confirm') {
    //     return this.$message.info('已取消删除')
    //   }
    //   const { data: res } = await this.$http.delete('/users/' + id)
    //   if (res.meta.status !== 200) {
    //     return this.$message.error('删除用户失败')
    //   }
    //   this.$message.success('删除用户成功')
    //   this.getuserlist()
    // },
    deletefor(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete('/users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getuserlist()
      })
        .catch(() => {
          this.$message.error('删除用户失败')
        })
    },
    async setRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色失败')
      }
      this.roleList = res.data
      this.setroledialogVisible = true
    },
    async saveRoleInfo() {
      if (!this.selectroleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectroleId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getuserlist()
      this.setroledialogVisible = false
    },
    setroledialogClosed() {
      this.selectroleId = ''
      this.userInfo = {}
    }
  }
}
</script>
