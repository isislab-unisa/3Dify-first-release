#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os
import pprint
import math
import numpy as np
import time
import log

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
        self.functions["applyModifiers"] = self.applyModifiers

    def loadMhm(self,conn,jsonCall):
        human.load("D:\\Downloads\\output (1).mhm", True)
        jsonCall.setData("OK")

    def exportFbx(self,conn,jsonCall):
        mhapi.exports.exportAsFBX("D:\\myHuman.fbx", False)
        jsonCall.setData("OK")

    def applyModifiers(self, conn, jsonCall):
        human.resetMeshValues()
        for key, value in jsonCall.params.items():
            modifier = self.api.internals.getHuman().getModifier(key)
            if not modifier:
                jsonCall.setError("No such modifier")
                return
            log.debug(key + " " + value)
            self.api.modifiers.applyModifier(key, float(value), True)
        jsonCall.setData("OK")