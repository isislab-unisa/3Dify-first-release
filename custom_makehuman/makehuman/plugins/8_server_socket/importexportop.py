#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os
import pprint
import math
import numpy as np
import time

from .abstractop import AbstractOp
from core import G

pp = pprint.PrettyPrinter(indent=4)

mhapi = G.app.mhapi
human = mhapi.internals.getHuman()

class ImportExportOps(AbstractOp):

    def __init__(self, sockettaskview):
        super().__init__(sockettaskview)

        # Sync operations
        self.functions["loadMhm"] = self.loadMhm
        self.functions["exportFbx"] = self.exportFbx

    def loadMhm(self,conn,jsonCall):
        human.load("D:\\Downloads\\output (1).mhm", True)
        jsonCall.setData("OK")

    def exportFbx(self,conn,jsonCall):
        mhapi.exports.exportAsFBX("D:\\myHuman.fbx", False)
        jsonCall.setData("OK")