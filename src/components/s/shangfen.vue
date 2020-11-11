<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showaddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover = "false">
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style='color: lightgreen;'></i>
          <i class="el-icon-error" v-else style='color: red;'></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 5, 8]"
      :page-size="2"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
    title="添加分类"
    :visible.sync="addCatedialogVisible"
    width="50%"
    :before-close="addhandleClose">
      <el-form :model="addCateForm" :rules="addCaterules" ref="addCateFormref" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
          :props="cascaderProps"
          v-model="selecteKeys"
          :options="parentCateList"
          @change="parentCateChanged" clearable ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="guanaddCatedialog">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
    title="编辑分类"
    :visible.sync="editCatedialogVisible"
    width="50%"
    :before-close="editClose">
      <el-form :model="editCateForm" ref="editCateFormref" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCatedialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 父级分类的列表
      parentCateList: [],
      // 选中的父级分类的id数组
      selecteKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      catelist: [],
      total: 0,
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      },
      {
        label: '是否有效',
        type: 'template',
        template: 'isok'
      },
      {
        label: '排序',
        type: 'template',
        template: 'order'
      },
      {
        label: '操作',
        type: 'template',
        template: 'opt'
      }],
      addCatedialogVisible: false,
      editCatedialogVisible: false,
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0,
        isok: '',
        order: '',
        opt: ''
      },
      addCaterules: {
        cat_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]
      },
      // 拿到的数据
      editCateForm: {
        cat_id: '',
        cat_name: '',
        cat_pid: '',
        cat_level: ''
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      }
      console.log(res.data)
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 分页的条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 分页的页数改变
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getCateList()
    },
    // 展示添加对话框
    showaddCate() {
      this.getParentCateList()
      this.addCatedialogVisible = true
    },
    // 关闭添加对话框
    handleClose() {},
    // 展示编辑对话框
    async editCate(id) {
      console.log(id)
      const { data: res } = await this.$http.get(`categories/${id}`)
      console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('更新失败')
      }
      // console.log(res.data)
      this.editCateForm = res.data
      this.editCatedialogVisible = true
    },
    // 监听事件，关闭编辑对话框
    editClose() {},
    // 获取父级分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 点击添加分类对话框的确定按钮
    // guanaddCatedialog() {
    //   this.addCatedialogVisible = false
    // },
    parentCateChanged() {
      console.log(this.selecteKeys)
      if (this.selecteKeys.length > 0) {
        this.addCateForm.cat_pid = this.selecteKeys[this.selecteKeys.length - 1]
        this.addCateForm.cat_level = this.selecteKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addhandleClose() {
      this.$refs.addCateFormref.resetFields()
      this.selecteKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    guanaddCatedialog() {
      this.$refs.addCateFormref.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类cg')
        this.getCateList()
        this.addCatedialogVisible = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader-menu {
  height: 300px;
}
</style>
